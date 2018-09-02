import React, { Component } from "react";
import Toolbar from "../toolbar";
import EditorView from "../editor";
import MetricsBar from "../metrics-bar";
import LayersSidebar from "../layers-sidebar";
import OpenDocumentDialog from "../open-document";
import LoginDialog from "../login";
import NewAccountDialog, { NewAccount } from "../new-account";
import NewDocumentDialog from "../new-document";
import Modal from "../modal";
import get from "lodash/fp/get";
import { ViewContainer, DocumentView } from "./components";
import StartModal from "../start-modal";

import {
  documentsWithEditorState,
  packageDocumentToJson,
} from "../../util/documents";
import {
  updatedDocumentStateForObjectChanges,
  updatedDocumentStateForLayerChanges,
  updatedDocumentStateForClipboardAction,
  updatedDocumentStateForDeleteAction,
  ClipboardAction,
  LayerMutationDelta,
} from "./editor-actions";
import shortid from "shortid";
import {
  currentUserQuery,
  documentsQuery,
  loginMutation,
  saveDocumentMutation,
} from "../../queries";
import { StateContext } from "../../contexts";
import {
  PubUser,
  PubDocument,
  PubShape,
  PubShapeChanges,
} from "../../types/pub-objects";
import { Connect, query, mutation } from "urql";
import {
  LoginMutation,
  CurrentUserQuery,
  RefetchCurrentUser,
  DocumentsQuery,
  SaveDocumentMutation,
} from "../../types/data";
import { metrics } from "../../util/constants";

interface Props {
  user: PubUser | null;
  documents: Array<PubDocument>;
  login: LoginMutation;
  refetchCurrentUser: RefetchCurrentUser;
  saveDocument: SaveDocumentMutation;
}

interface State {
  documents: Array<PubDocument>;
  currentDocument: PubDocument | null;
  selectedObject: PubShape | null;
  clipboardContents: PubShape | null;
  newDocumentModalVisible: boolean;
  openDocumentModalVisible: boolean;
  startModalVisible: boolean;
  layersPanelVisible: boolean;
  loginModalVisible: boolean;
  newAccountModalVisible: boolean;
  zoom: number;
}

class DocumentsView extends Component<Props, State> {
  state = {
    documents: [],
    currentDocument: null,
    selectedObject: null,
    clipboardContents: null,
    newDocumentModalVisible: false,
    openDocumentModalVisible: false,
    startModalVisible: false,
    layersPanelVisible: false,
    loginModalVisible: false,
    newAccountModalVisible: false,
    zoom: 1,
  };

  getActions = () => ({
    addObject: this.addObject,
    deleteObject: this.deleteObject,
    handleClipboardAction: this.handleClipboardAction,
    logout: this.logOut,
    getDocument: this.getDocument,
    saveDocument: this.saveDocument,
    setZoom: this.setZoom,
    showNewDocumentModal: this.showNewDocumentModal,
    showOpenDocumentModal: this.showOpenDocumentModal,
    toggleLayersPanel: this.toggleLayersPanel,
    updateSelectedObject: this.updateSelectedObject,
    adjustObjectLayer: this.adjustObjectLayer,
    toggleLoginDialog: this.showLoginModal,
    hideStartModal: this.hideStartModal,
    showNewAccountModal: this.showNewAccountModal,
    showLoginModal: this.showLoginModal,
    hideLoginModal: this.hideLoginModal,
  });

  /**
   * Display Actions
   */

  hideStartModal = () => this.setState({ startModalVisible: false });
  showNewAccountModal = () => this.setState({ newAccountModalVisible: true });
  hideNewAccountModal = () => this.setState({ newAccountModalVisible: false });
  showNewDocumentModal = () => this.setState({ newDocumentModalVisible: true });
  hideNewDocumentModal = () =>
    this.setState({ newDocumentModalVisible: false });
  showOpenDocumentModal = () =>
    this.setState({ openDocumentModalVisible: true });
  hideOpenDocumentModal = () =>
    this.setState({ openDocumentModalVisible: false });
  showLoginModal = () => this.setState({ loginModalVisible: true });
  hideLoginModal = () => this.setState({ loginModalVisible: false });
  toggleLayersPanel = () =>
    this.setState(prevState => ({
      layersPanelVisible: !prevState.layersPanelVisible,
    }));

  /**
   * Data Actions
   */

  logOut = async () => {
    window.localStorage.removeItem("authorization_token");
    return await this.props.refetchCurrentUser({ skipCache: true });
  };

  createAccount = async (account: NewAccount): Promise<string | null> => {
    return null;
  };

  getDocument = (id: string) => {
    const doc = this.props.documents.filter(d => d.id === id)[0];
    this.setCurrentDocument(doc);
  };

  saveDocument = async () => {
    if (!this.state.currentDocument) {
      return;
    }
    return this.props.saveDocument({
      document: {
        ...packageDocumentToJson(this.state.currentDocument),
        id: get("id")(this.state.currentDocument),
      },
    });
  };

  /**
   * Editor Actions
   */

  updateSelectedObject = (sender: PubShapeChanges) =>
    this.setState(
      (prevState: State): Pick<State, never> => {
        const updatedState = updatedDocumentStateForObjectChanges(
          sender,
          prevState.selectedObject!,
          prevState.currentDocument!
        );
        return updatedState;
      }
    );

  setZoom = (zoom: number = 1) => this.setState({ zoom });

  setCurrentDocument = (doc: PubDocument | null) =>
    this.setState(
      (prevState: State): Pick<State, never> => {
        const currentDocumentId = (prevState.currentDocument || { id: -1 }).id;
        const documentId = (doc || { id: -2 }).id;
        if (currentDocumentId === documentId) {
          return { currentDocument: doc, layersPanelVisible: true };
        } else {
          return {
            currentDocument: doc,
            layersPanelVisible: true,
            selectedObject: null,
            zoom: 1,
          };
        }
      },
      () => {
        if (doc && "id" in doc) {
          window.localStorage.setItem("current_document_id", doc.id!);
        }
      }
    );

  addObject = (sender: PubShape) => {
    const currentDocument = this.state.currentDocument as PubDocument | null;
    if (!currentDocument) {
      return;
    }
    const newObject = {
      ...sender,
      z: currentDocument.shapes.length + 1,
      id: shortid.generate(),
    };
    this.setState(
      (prevState: State): Pick<State, never> => ({
        currentDocument: {
          ...prevState.currentDocument,
          shapes: [
            ...(prevState.currentDocument || { shapes: [] }).shapes,
            newObject,
          ],
        },
        selectedObject: newObject,
      })
    );
  };

  deleteObject = (sender?: PubShape) =>
    this.setState(
      (prevState: State): Pick<State, never> =>
        updatedDocumentStateForDeleteAction(
          sender || prevState.selectedObject,
          prevState.currentDocument
        )
    );

  adjustObjectLayer = (sender: LayerMutationDelta) =>
    this.setState(
      (prevState: State): Pick<State, never> =>
        updatedDocumentStateForLayerChanges(sender, prevState.currentDocument)
    );

  handleClipboardAction = (action: ClipboardAction) =>
    this.setState(
      (prevState: State): Pick<State, never> =>
        updatedDocumentStateForClipboardAction(action, prevState)
    );

  handleCreateNewDocument = async (sender: {
    name: string;
    orientation: string;
  }) => {
    const payload = {
      name: sender.name,
      ...metrics[sender.orientation],
      shapes: [],
    };
    if (this.props.user) {
      try {
        const { saveDocument } = await this.props.saveDocument({
          document: payload,
        });
        if (this.state.currentDocument) {
          await this.saveDocument();
        }
        this.setCurrentDocument(saveDocument);
        return;
      } catch (e) {
        return;
      }
    }
    this.setCurrentDocument(payload);
  };

  render() {
    const { currentDocument } = this.state;
    const currentState = {
      actions: this.getActions(),
      currentDocument,
      user: this.props.user,
      selectedObject: this.state.selectedObject,
      clipboardContents: this.state.clipboardContents,
      zoom: this.state.zoom,
      layersPanelVisible: this.state.layersPanelVisible,
    };
    return (
      <StateContext.Provider value={currentState}>
        <ViewContainer>
          <Modal
            renderContent={<StartModal />}
            visible={this.state.startModalVisible}
          />
          <Modal
            renderContent={
              <LoginDialog
                login={this.props.login}
                refetchCurrentUser={this.props.refetchCurrentUser}
                onDismiss={this.hideLoginModal}
              />
            }
            visible={this.state.loginModalVisible}
          />
          <Modal
            renderContent={
              <NewAccountDialog
                onCreateAccount={this.createAccount}
                onDismiss={this.hideNewAccountModal}
              />
            }
            visible={this.state.newAccountModalVisible}
          />
          <Modal
            renderContent={
              <OpenDocumentDialog
                documents={this.props.documents}
                onOpenDocument={this.getDocument}
                onDismiss={this.hideOpenDocumentModal}
              />
            }
            visible={this.state.openDocumentModalVisible}
          />
          <Modal
            renderContent={
              <NewDocumentDialog
                onDismiss={this.hideNewDocumentModal}
                didCreateDocument={this.handleCreateNewDocument}
              />
            }
            visible={this.state.newDocumentModalVisible}
          />
          <Toolbar />
          <MetricsBar />
          <DocumentView>
            <EditorView />
            <LayersSidebar />
          </DocumentView>
        </ViewContainer>
      </StateContext.Provider>
    );
  }
}

type Queries = [CurrentUserQuery, DocumentsQuery];
interface Mutations {
  login: LoginMutation;
  saveDocument: SaveDocumentMutation;
}

export default () => (
  <Connect<Queries, Mutations>
    query={[query(currentUserQuery), query(documentsQuery)]}
    mutation={{
      login: mutation(loginMutation),
      saveDocument: mutation(saveDocumentMutation),
    }}
  >
    {({ data, login, refetch, saveDocument }) => {
      let user: PubUser | null = null;
      let documents: Array<PubDocument> = [];
      if (data) {
        const [currentUserResponse, documentsResponse] = data;
        user = currentUserResponse.currentUser;
        documents = documentsWithEditorState(documentsResponse.documents || []);
      }
      return (
        <DocumentsView
          user={user}
          documents={documents}
          refetchCurrentUser={refetch}
          login={login}
          saveDocument={saveDocument}
        />
      );
    }}
  </Connect>
);
