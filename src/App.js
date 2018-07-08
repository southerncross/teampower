import React, { Component } from 'react';
import DatePicker from 'antd/lib/date-picker';
import moment from 'moment';

import TeamTable from './TeamTable';
import { ROLE, NATIONAL_HOLIDAYS, COMPANY_HOLIDAYS, ROLE_TO_FACTOR } from './constants';

import './App.css';

function calculatePowerInfo({ startDate, endDate, user }) {
  const { role, leaves } = user;
  const dateDiff = endDate.dayOfYear() - startDate.dayOfYear() + 1;
  const startDay = startDate.day();
  const endDay = endDate.day();
  let workdayCount = Math.floor(dateDiff / 7) * 5;
  if (dateDiff % 7 != 0) {
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
    if (startDate.isAfter(holiday.date) || endDate.isBefore(holiday.date)) {
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
    if (startDate.isAfter(holiday.date) || endDate.isBefore(holiday.date)) {
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
    for (let i = 0; i <= leave.length; i++) {
      const current = moment(leave.startDate).add(i, 'day');
      if (startDate.isAfter(current) || endDate.isBefore(current)) {
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
  detail = `(${detail}) * ${role}开发力${ROLE_TO_FACTOR[role]}`
  const power = (finalWorkdayCount * ROLE_TO_FACTOR[role]).toFixed(1);
  return { power, detail };
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      team: {
        李舜阳: { role: ROLE.MANAGER, leaves: [] },
        王思航: { role: ROLE.FULLTIME, leaves: [] },
        范长勇: { role: ROLE.PARTTIME, leaves: [] },
        高博: { role: ROLE.FULLTIME, leaves: [] },
        舒丽琦: { role: ROLE.NEWBIE, leaves: [] },
        牛旷铎: { role: ROLE.NEWBIE, leaves: [] },
      },
      startDate: moment().startOf('month'),
      endDate: moment().endOf('month'),
    };

    this.onRangeChange = this.onRangeChange.bind(this);
  }

  onRangeChange([startDate, endDate]) {
    this.setState({ startDate, endDate });
  }

  static getDerivedStateFromProps(nextProps, nextState) {
    const { team, startDate, endDate } = nextState;
    const newTeam = {};
    Object.keys(team).forEach((name) => {
      newTeam[name] = team[name];
      newTeam[name].powerInfo = calculatePowerInfo({ startDate, endDate, user: team[name] });
    });
    return newTeam;
  }

  render() {
    const { team, startDate, endDate } = this.state;

    return (
      <div>
        <div>
          <DatePicker.RangePicker value={[startDate, endDate]} onChange={this.onRangeChange}/>
        </div>
        <TeamTable team={team} startDate={startDate} endDate={endDate}/>
      </div>
    );
  }
}

export default App;
