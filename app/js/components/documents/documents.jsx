import AuthComponent from '../../core/auth-component';
import React, {Component, PropTypes} from 'react';

import DocumentsNavbar from './documents.navbar';
import DocumentItem from './document.item';
import NewDocumentModal from './documents.new.modal';
import DocumentStore from '../../stores/document.store';
import UserStore from '../../stores/user.store';

import DocumentActions from '../../actions/document.actions';
import UserActions from '../../actions/user.actions';

export default class Documents extends AuthComponent {
  constructor(props, context) {
    super(props);
    this.loginStateChanged = this.loginStateChanged.bind(this);
    this.dataChanged = this.dataChanged.bind(this);

    this.state = {
      documents: [],
      selectedDocument: null,
      isNewDocModalOpen: false
    };
  }

  componentWillMount() {
    UserStore.addChangeListener(this.loginStateChanged);
    DocumentStore.addChangeListener(this.dataChanged);
  }

  componentDidMount() {
    DocumentActions.list();
    document.title = 'Publications — All Documents';
  }

  componentWillUnmount() {
    UserStore.removeChangeListener(this.loginStateChanged);
    DocumentStore.removeChangeListener(this.dataChanged);
    this.setState({selectedDocument: null});
    document.title = 'Publications';
  }

  render() {
    return (
      <div>
        <NewDocumentModal
          createNewDocument={o => this.createNewDocument(o)}
          toggleNewDocumentModal={e => this.toggleNewDocumentModal(e)}
          isOpen={this.state.isNewDocModalOpen} />
        <DocumentsNavbar
          documentIsSelected={this.state.selectedDocument !== null}
          editDocument={e => this.editDocument(e)}
          deleteDocument={e => this.deleteDocument(e)}
          createNewDocument={e => this.toggleNewDocumentModal(e)}
          logOut={e => this.logOut(e)} />
        <div className="app-content">
          <ul className="document-items" onClick={() => this.updateSelectedDocument(null, event)}>
            {
              this.state.documents.map(doc => {
                return (
                  <DocumentItem
                    key={doc.get('_id')}
                    doc={doc}
                    editDocument={::this.editDocument}
                    selectedDocument={this.state.selectedDocument}
                    updateSelectedDocument={::this.updateSelectedDocument} />);
              })
            }
          </ul>
        </div>
      </div>
    );
  }

  updateSelectedDocument(sender, event) {
    if (!!event) event.preventDefault();
    this.setState({selectedDocument: sender});
  }

  loginStateChanged() {
    if (!UserStore.isAuthenticated()) {
      this.context.router.transitionTo('login');
    }
  }

  dataChanged() {
    this.setState({
      documents: DocumentStore.getDocuments(),
      isNewDocModalOpen: false
    });
  }

  toggleNewDocumentModal() {
    this.setState({
      isNewDocModalOpen: !this.state.isNewDocModalOpen
    });
  }

  createNewDocument(options) {
    DocumentActions.create({
      name: options.name,
      width: options.width,
      height: options.height
    });
  }

  editDocument() {
    let selectedDocument = this.state.selectedDocument;

    if (selectedDocument) {
      this.context.router.transitionTo('document-edit', {id: selectedDocument.get('_id')});
    }
  }

  deleteDocument() {
    let selectedDocument = this.state.selectedDocument;

    if (!!selectedDocument) {
      DocumentActions.remove(selectedDocument);
    }
  }

  logOut() {
    UserActions.logout();
  }
}

Documents.contextTypes = {router: React.PropTypes.func.isRequired};
