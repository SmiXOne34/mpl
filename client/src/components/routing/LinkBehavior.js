import React, { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// This component is used to fix the findDOMNode warning when using Material-UI with React Router
const LinkBehavior = forwardRef((props, ref) => (
  <RouterLink ref={ref} {...props} />
));

export default LinkBehavior;