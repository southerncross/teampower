import React from 'react';
import PropTypes from 'prop-types';
import Tag from 'antd/lib/tag';

import { ROLE } from './constants';

class RoleTag extends React.Component {
  roleToColor(role) {
    switch (role) {
      case ROLE.MANAGER: return 'magenta';
      case ROLE.FULLTIME: return 'blue';
      case ROLE.PARTTIME: return 'orange';
      case ROLE.NEWBIE: return 'green';
      case ROLE.INTERN: return 'cyan';
      default: return '';
    }
  }

  render() {
    const { role } = this.props;
    return <Tag color={this.roleToColor(role)}>{role}</Tag>;
  }
}

export default RoleTag;
