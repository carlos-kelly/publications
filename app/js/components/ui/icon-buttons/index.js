import styled from "styled-components"

import { GridIconButton } from "./grid"
import { DiskIconButton } from "./disk"
import { CutIconButton } from "./cut"
import { CopyIconButton } from "./copy"
import { PasteIconButton } from "./paste"
import { DeleteIconButton } from "./delete"
import { DocumentsIconButton } from "./documents"
import { CloseIconButton } from "./close"
import { ShapeAddIconButton } from "./shape-add"

export const IconContainer = styled.div`
  display: flex;
  flex-align: center;
  justify-content: center;
`

export {
  GridIconButton,
  DiskIconButton,
  CutIconButton,
  CopyIconButton,
  PasteIconButton,
  DeleteIconButton,
  DocumentsIconButton,
  CloseIconButton,
  ShapeAddIconButton
}
