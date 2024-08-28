/* eslint-disable import/prefer-default-export */
import { Box } from '@adminjs/design-system';
import { styled } from '@adminjs/design-system/styled-components';

const Spinner = styled.div.attrs({
  className: 'lds-facebook',
})`
  & {
    display: inline-block;
    position: relative;
    width: 1rem;
    height: 1rem;
  }
  & div {
    display: inline-block;
    position: absolute;
    width: .25rem;
    background: ${({ theme }) => theme.colors.primary100};
    animation: lds-facebook 1s cubic-bezier(0, 0.5, 0.5, 1) infinite;
  }
  & div:nth-child(1) {
    left: 0;
    animation-delay: -0.24s;
  }
  & div:nth-child(2) {
    left: .3rem;
    animation-delay: -0.12s;
  }
  & div:nth-child(3) {
    left: .65rem;
    animation-delay: 0;
  }
  @keyframes lds-facebook {
    0%, 80%, 100% {
      top: 0;
      height:100%;
    }
    40% {
      top: calc(100% / 3 );
      height: calc(100% / 3 );
    }
  }

`

const Loader = ({style}) => (
  <Box
    style={{ textAlign: 'center',display: 'inline-block', ...style }}
    data-testid="adminjs_Loader"
    className='adminjs_Loader'
  >
    <Spinner>
      <div />
      <div />
      <div />
    </Spinner>
  </Box>
)

Loader.displayName = 'Loader'

export default Loader
