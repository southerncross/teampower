import React from 'react';
import PropTypes from 'prop-types';
import Table from 'antd/lib/table';
import Timeline from 'antd/lib/timeline';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Modal from 'antd/lib/modal';
import Input from 'antd/lib/input';
import DatePicker from 'antd/lib/date-picker';
import Popover from 'antd/lib/popover';
import moment from 'moment';

import { NATIONAL_HOLIDAYS, COMPANY_HOLIDAYS, ROLE_TO_FACTOR } from './constants';
import RoleTag from './RoleTag';

class TeamTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showLeaveModal: false,
      leaveName: '', // 请假人
      leaveReason: '',
      leaveRange: [],
    };

    this.onShowLeaveModal = (leaveName) => () => this.setState({ showLeaveModal: true, leaveName });
    this.onHideLeaveModal = () => this.setState({ showLeaveModal: false });
    this.onLeavReasonChange = (e) => this.setState({ leaveReason: e.target.value });
    this.onLeaveRangeChange = (leaveRange) => this.setState({ leaveRange });
    this.roleRenderer = this.roleRenderer.bind(this);
    this.leaveRenderer = this.leaveRenderer.bind(this);
    this.powerRenderer = this.powerRenderer.bind(this);
    this.footerRenderer = this.footerRenderer.bind(this);
    this.onAddLeave = this.onAddLeave.bind(this);
    this.onRemoveLeave = this.onRemoveLeave.bind(this);

    this.columns = [
      { title: '姓名', dataIndex: 'name', key: 'name' },
      { title: '角色', dataIndex: 'role', key: 'role', render: this.roleRenderer },
      { title: '请假', dataIndex: 'leave', key: 'leave', render: this.leaveRenderer },
      { title: '人力', dataIndex: 'powerInfo', key: 'powerInfo', render: this.powerRenderer },
    ];
  }

  onAddLeave() {
    const { leaveName, leaveReason, leaveRange } = this.state;
    if (!leaveRange || leaveRange.length <= 0) {
      return;
    }
    this.props.onAddLeave();
  }

  onRemoveLeave(leaveName, leaveId) {
    return () => this.props.onRemoveLeave();
  }

  roleRenderer(text, record) {
    return <RoleTag role={record.role}/>;
  }

  powerRenderer(text, record) {
    return (
      <div>
        <Popover content={record.powerInfo.detail} title="详情">
          {record.powerInfo.power}
        </Popover>
      </div>
    )
  }

  leaveRenderer(text, record) {
    return (
      <div>
        {record.leaves && record.leaves.length > 0 && (
          <Timeline>
            {record.leaves.sort((a, b) => a.startDate < b.startDate).map((leave) => {
              return (
                <Timeline.Item key={leave.startDate}>
                  {leave.startDate}
                  <Icon type="close-circle-o" onClick={this.onRemoveLeave(record.name, record.id)}/>
                </Timeline.Item>
              );
            })}
          </Timeline>
        )}
        <Icon type="plus-square-o" onClick={this.onShowLeaveModal(record.name)}/>
      </div>
    );
  }

  footerRenderer(records) {
    const totalPower = records.reduce((result, record) => Number(result) + Number(record.powerInfo.power), 0);
    return (
      <div>
        总人力{totalPower}（天/人）
      </div>
    )
  }

  render() {
    const { showLeaveModal, leaveName, leaveReason, leaveRange } = this.state;
    const { team } = this.props;

    const data = Object.keys(team).map((name) => {
      const user = team[name];
      return {
        key: name,
        name,
        role: user.role,
        leaves: user.leaves,
        powerInfo: user.powerInfo,
      };
    });

    return (
      <div>
        <Table columns={this.columns} dataSource={data} footer={this.footerRenderer}/>
        <Modal
          visible={showLeaveModal}
          title={`新增${leaveName}的请假`}
          onCancel={this.onHideLeaveModal}
          onOk={this.onAddLeave}
        >
          <div>
            <Input placeholder="请假原因" value={leaveReason} onChange={this.onLeavReasonChange}/>
          </div>
          <div>
            <DatePicker.RangePicker onChange={this.onLeaveRangeChange}/>
          </div>
        </Modal>
      </div>
    );
  }
}

TeamTable.propTypes = {
  team: PropTypes.object,
  startDate: PropTypes.instanceOf(moment),
  endDate: PropTypes.instanceOf(moment),
  onAddLeave: PropTypes.func,
};

export default TeamTable;
