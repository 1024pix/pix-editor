import { Box } from '@adminjs/design-system';
import { styled } from '@adminjs/design-system/styled-components';

const Card = styled(Box)`
  display: block;
  color: ${({ theme }) => theme.colors.grey100};
  height: 100%;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.space.md};
  transition: all 0.1s ease-in;

  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.primary60};
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
  }

  & .dsc-icon svg, .gh-icon svg {
    width: 64px;
    height: 64px;
  }
`;

Card.defaultProps = {
  variant: 'container',
  boxShadow: 'card',
};

export default Card;
