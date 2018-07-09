import React from 'react';
import PropTypes from 'prop-types';
import Table from 'antd/lib/table';
import Timeline from 'antd/lib/timeline';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';

import Popover from 'antd/lib/popover';
import moment from 'moment';

import { NATIONAL_HOLIDAYS, COMPANY_HOLIDAYS, ROLE_TO_FACTOR } from '../common/constants';
import { uniqueId } from '../common/util';
import RoleTag from '../common/RoleTag';
import EditLeaveModal from './EditLeaveModal';
import EditTeamMemberModal from './EditTeamMemberModal';

function calculateHumanCapicalInfo({ startDateMoment, endDateMoment, member }) {
  const { role, leaves } = member;
  const dateDiff = endDateMoment.diff(startDateMoment, 'days') + 1;
  const startDay = startDateMoment.day();
  const endDay = endDateMoment.day();
  let workdayCount = Math.floor(dateDiff / 7) * 5;
  if (dateDiff % 7 !== 0) {
    for (let i = startDay <= endDay ? startDay : startDay - 7; i <= endDay; i++) {
      const day = (i + 7) % 7;
      if (day !== 0 && day !== 6) {
        workdayCount++;
      }
    }
  }

  const holidayDateSet = new Set();
  const lieuDateSet = new Set();
  const holidayNameToCount = {};

  NATIONAL_HOLIDAYS.forEach((holiday) => {
    if (startDateMoment.isAfter(holiday.date) || endDateMoment.isBefore(holiday.date)) {
      return;
    }
    holidayNameToCount[holiday.name] = holidayNameToCount[holiday.name] || 0;
    if (holiday.type === '上班') {
      lieuDateSet.add(holiday.date);
      holidayNameToCount[holiday.name]--;
    } else {
      holidayDateSet.add(holiday.date);
      const day = moment(holiday.date).day();
      if (day !== 0 && day !== 6) {
        holidayNameToCount[holiday.name]++;
      }
    }
  });

  COMPANY_HOLIDAYS.forEach((holiday) => {
    if (startDateMoment.isAfter(holiday.date) || endDateMoment.isBefore(holiday.date)) {
      return;
    }
    holidayNameToCount[holiday.name] = holidayNameToCount[holiday.name] || 0;
    if (holidayDateSet.has(holiday.date)) {
      return;
    } else if (lieuDateSet.has(holiday.date)) {
      holidayNameToCount[holiday.name]++;
      holidayDateSet.add(holiday.date);
      lieuDateSet.remove(holiday.date);
    } else {
      const day = moment(holiday.date).day();
      if (day !== 0 && day !== 6) {
        holidayNameToCount[holiday.name]++;
      }
    }
  });

  let leaveCount = 0;
  (leaves || []).forEach((leave) => {
    for (let current = moment(leave.startDateStr); current.isSameOrBefore(leave.endDateStr); current.add(1, 'day')) {
      if (startDateMoment.isAfter(current) || endDateMoment.isBefore(current)) {
        continue;
      }
      const day = current.day();
      const date = current.format('YYYY-MM-DD');
      if (day !== 0 && day !== 6) {
        // 请假当天是工作日
        if (holidayDateSet.has(date)) {
          // 该工作日原本是要放假的，则不算在人力损耗里
          continue;
        } else {
          // 该工作日正常上班，则计算在人力损耗里
          leaveCount++;
        }
      } else {
        // 请假当前是周末
        if (lieuDateSet.has(date)) {
          // 该周末本来是要调班，则计算人力损耗
          leaveCount++;
        } else {
          // 该周末正常放阿基，则不计算人力损耗
          continue;
        }
      }
    }
  });

  let finalWorkdayCount = workdayCount;
  let detail = `基本工作日${workdayCount}天`;
  Object.keys(holidayNameToCount).forEach((holidayName) => {
    const count = holidayNameToCount[holidayName];
    if (count > 0) {
      detail += ` - ${holidayName}${count}天`;
      finalWorkdayCount -= count;
    }
  });
  if (leaveCount > 0) {
    detail += ` - 请假${leaveCount}天`;
    finalWorkdayCount -= leaveCount;
  }
  detail = `(${detail}) * ${role}开发力${ROLE_TO_FACTOR[role].toFixed(1)}`
  const value = (finalWorkdayCount * ROLE_TO_FACTOR[role]).toFixed(1);
  console.error('boring detail', detail, member);
  return { value, detail };
}

class HumanCapitalTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      memberIdToHumanCapitalInfo: {},
      showEditLeaveModal: false,
      showEditMemberModal: false,
      focusingMemberId: '',
      focusingLeave: null,
      focusingMember: null,
    };

    this.onShowEditLeaveModal = this.onShowEditLeaveModal.bind(this);
    this.onHideEditLeaveModal = () => this.setState({ showEditLeaveModal: false });
    this.onShowEditMemberModal = this.onShowEditMemberModal.bind(this);
    this.onHideEditMemberModal = () => this.setState({ showEditMemberModal: false });

    this.nameRenderer = this.nameRenderer.bind(this);
    this.roleRenderer = this.roleRenderer.bind(this);
    this.leaveRenderer = this.leaveRenderer.bind(this);
    this.humanCapitalRenderer = this.humanCapitalRenderer.bind(this);
    this.footerRenderer = this.footerRenderer.bind(this);
    this.onEditLeave = this.onEditLeave.bind(this);
    this.onRemoveLeave = this.onRemoveLeave.bind(this);
    this.onEditMember = this.onEditMember.bind(this);
    this.onRemoveMember = this.onRemoveMember.bind(this);

    this.columns = [
      { title: '姓名', dataIndex: 'name', key: 'name', render: this.nameRenderer },
      { title: '角色', dataIndex: 'role', key: 'role', render: this.roleRenderer },
      { title: '请假', dataIndex: 'leave', key: 'leave', render: this.leaveRenderer },
      { title: '人力', dataIndex: 'humanCapical', key: 'humanCapical', render: this.humanCapitalRenderer },
    ];
  }

  onShowEditLeaveModal(focusingMemberId, focusingLeave) {
    return () => this.setState({ showEditLeaveModal: true, focusingMemberId, focusingLeave })
  }

  onShowEditMemberModal(focusingMember) {
    return () => this.setState({ showEditMemberModal: true, focusingMember });
  }

  onEditLeave(memberId, editingLeave) {
    const { teamMembers } = this.props;

    for (const member of teamMembers) {
      if (member.id === memberId) {
        member.leaves = member.leaves || [];
        if (editingLeave.id) {
          for (let i = 0; i < member.leaves.length; i++) {
            if (member.leaves[i].id === editingLeave.id) {
              member.leaves[i] = editingLeave;
            }
            break;
          }
          break;
        } else {
          editingLeave.id = uniqueId();
          member.leaves.push(editingLeave);
        }
        break;
      }
    }

    this.props.onTeamMembersChange(teamMembers);
  }

  onRemoveLeave(removingLeave) {
    return () => {
      const { teamMembers } = this.props;

      for (const member of teamMembers) {
        member.leaves = member.leaves.filter((x) => x.id !== removingLeave.id);
      }

      this.props.onTeamMembersChange(teamMembers);
    };
  }

  onEditMember(editingMember) {
    const { teamMembers } = this.props;

    if (editingMember.id) {
      for (let i = 0; i < teamMembers.length; i++) {
        if (teamMembers[i].id === editingMember.id) {
          teamMembers[i] = editingMember;
          break;
        }
      }
    } else {
      editingMember.id = uniqueId();
      teamMembers.push(editingMember);
    }

    this.props.onTeamMembersChange(teamMembers);
  }

  onRemoveMember(removingMember) {
    return () => {
      const teamMembers = this.props.teamMembers.filter((x) => x.id !== removingMember.id);
      this.props.onTeamMembersChange(teamMembers);
    };
  }

  nameRenderer(text, teamMember) {
    return (
      <div>
        {text}
        <Icon type="edit" onClick={this.onShowEditMemberModal(teamMember)}/>
        <Icon type="close" onClick={this.onRemoveMember(teamMember)}/>
      </div>
    );
  }

  roleRenderer(text, teamMember) {
    return <RoleTag role={teamMember.role}/>;
  }

  humanCapitalRenderer(text, teamMember) {
    const { memberIdToHumanCapitalInfo } = this.state;
    const info = memberIdToHumanCapitalInfo[teamMember.id] || {};
    return (
      <div>
        <Popover content={info.detail} title="详情">
          {info.value}
        </Popover>
      </div>
    )
  }

  leaveRenderer(text, teamMember) {
    const { leaves = [] } = teamMember;
    return (
      <div>
        <Timeline>
          {leaves.sort((a, b) => a.startDateStr < b.startDateStr).map((leave) => {
            return (
              <Timeline.Item key={leave.id}>
                {leave.reason || '无理由'}：{leave.startDateStr}至{leave.endDateStr}（{moment(leave.endDateStr).diff(leave.startDateStr, 'days') + 1}天）
                <Icon type="edit" onClick={this.onShowEditLeaveModal(teamMember.id, leave)}/>
                <Icon type="close" onClick={this.onRemoveLeave(leave)}/>
              </Timeline.Item>
            );
          })}
        </Timeline>
        <Icon type="plus" onClick={this.onShowEditLeaveModal(teamMember.id)}/>
      </div>
    );
  }

  footerRenderer(teamMembers) {
    const { memberIdToHumanCapitalInfo } = this.state;
    const totalHumanCapitalCount = teamMembers.reduce((result, member) => {
      return Number(result) + (Number(memberIdToHumanCapitalInfo[member.id].value) || 0);
    }, 0);
    return (
      <div>
        总人力{totalHumanCapitalCount}（天/人）
        <Button onClick={this.onShowEditMemberModal()}>添加团队成员</Button>
      </div>
    )
  }

  static getDerivedStateFromProps(nextProps, nextState) {
    const { teamMembers, startDateMoment, endDateMoment } = nextProps;
    const memberIdToHumanCapitalInfo = {};
    teamMembers.forEach((member) => {
      memberIdToHumanCapitalInfo[member.id] = calculateHumanCapicalInfo({ startDateMoment, endDateMoment, member });
    });
    return { memberIdToHumanCapitalInfo };
  }

  render() {
    const { showEditLeaveModal, showEditMemberModal, focusingMemberId, focusingLeave, focusingMember } = this.state;
    const { teamMembers } = this.props;

    const data = Object.values(teamMembers).map((row) => ({ ...row, key: row.id }));

    return (
      <div>
        <Table columns={this.columns} dataSource={data} footer={this.footerRenderer}/>
        {showEditLeaveModal && (
          <EditLeaveModal
            ownerId={focusingMemberId}
            initialValue={focusingLeave}
            onCancel={this.onHideEditLeaveModal}
            onSubmit={this.onEditLeave}
          />
        )}
        {showEditMemberModal && (
          <EditTeamMemberModal
            initialValue={focusingMember}
            onCancel={this.onHideEditMemberModal}
            onSubmit={this.onEditMember}
          />
        )}
      </div>
    );
  }
}

HumanCapitalTable.propTypes = {
  teamMembers: PropTypes.array,
  startDateMoment: PropTypes.instanceOf(moment),
  endDateMoment: PropTypes.instanceOf(moment),
  onTeamMembersChange: PropTypes.func,
};

export default HumanCapitalTable;
