import styled, { css } from "styled-components";

interface CanvasSVGProps {
  thumbnail: boolean;
}
export const CanvasSVG = styled.svg<CanvasSVGProps>`
  margin: 0;
  border-radius: ${props => (props.thumbnail ? "1px" : "0")};
  overflow: hidden;

  ${props =>
    !props.thumbnail &&
    css`
      margin: 26px 0 0 25px;
    `};

  @media print {
    margin: 0mm;
    border: none;
  }
`;
