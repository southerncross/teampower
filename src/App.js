import React, { Component } from 'react';
import DatePicker from 'antd/lib/date-picker';
import moment from 'moment';

import HumanCapitalTable from './human-capital/HumanCapitalTable';
import { getLocalStorage, setLocalStorage } from './common/util';
import { LS_TEAM_MEMBERS, LS_DATE_RANGE } from './common/constants';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      teamMembers: [],
      startDateMoment: null,
      endDateMoment: null,
    };

    this.onTeamMembersChange = this.onTeamMembersChange.bind(this);
    this.onDateRangeChange = this.onDateRangeChange.bind(this);
  }

  onTeamMembersChange(teamMembers) {
    setLocalStorage(LS_TEAM_MEMBERS, teamMembers);
    this.setState({ teamMembers });
  }

  onDateRangeChange([startDateMoment, endDateMoment]) {
    setLocalStorage(LS_DATE_RANGE, [startDateMoment.format('YYYY-MM-DD'), endDateMoment.format('YYYY-MM-DD')]);
    this.setState({ startDateMoment, endDateMoment })
  }

  componentDidMount() {
    const teamMembers = getLocalStorage(LS_TEAM_MEMBERS, []);
    const [startDateStr, endDateStr] = getLocalStorage(LS_DATE_RANGE, []);
    const startDateMoment = startDateStr ? moment(startDateStr) : moment().startOf('month');
    const endDateMoment = endDateStr ? moment(endDateStr) : moment().endOf('month');
    this.setState({ teamMembers, startDateMoment, endDateMoment });
  }

  render() {
    const { teamMembers, startDateMoment, endDateMoment } = this.state;

    return (
      <div>
        <div>
          <DatePicker.RangePicker value={[startDateMoment, endDateMoment]} onChange={this.onDateRangeChange}/>
        </div>
        <HumanCapitalTable
          teamMembers={teamMembers}
          startDateMoment={startDateMoment}
          endDateMoment={endDateMoment}
          onTeamMembersChange={this.onTeamMembersChange}
        />
      </div>
    );
  }
}

export default App;
