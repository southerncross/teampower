import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'antd/lib/modal';
import Radio from 'antd/lib/radio';
import Input from 'antd/lib/input';

import RoleTag from '../common/RoleTag';
import { ROLE } from '../common/constants';

class EditTeamMemberModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.initialValue ? props.initialValue.id : '',
      name: props.initialValue ? props.initialValue.name : '成员姓名',
      role: props.initialValue ? props.initialValue.role : ROLE.FULLTIME,
    };

    this.onNameChange = (e) => this.setState({ name: e.target.value });
    this.onRoleChange = (e) => this.setState({ role: e.target.value });
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit() {
    const { id, name, role } = this.state;
    this.props.onSubmit({ id, name, role });
    this.props.onCancel();
  }

  render() {
    const { name, role } = this.state;
    const { initialValue, onCancel } = this.props;

    return (
      <Modal
        visible={true}
        title={`${initialValue ? '修改' : '新增'}团队成员`}
        onCancel={onCancel}
        onOk={this.onSubmit}
      >
        <div>
          <Input placeholder="成员姓名" value={name} onChange={this.onNameChange}/>
        </div>
        <div>
          <Radio.Group value={role} onChange={this.onRoleChange}>
            {Object.values(ROLE).map((role) => <Radio key={role} value={role}><RoleTag role={role}/></Radio>)}
          </Radio.Group>
        </div>
      </Modal>
    );
  }
}

EditTeamMemberModal.propTypes = {
  initialValue: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    role: PropTypes.string,
  }),
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default EditTeamMemberModal;
