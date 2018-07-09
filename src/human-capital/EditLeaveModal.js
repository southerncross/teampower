import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Modal from 'antd/lib/modal';
import Input from 'antd/lib/input';
import DatePicker from 'antd/lib/date-picker';

class EditLeaveModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.initialValue ? props.initialValue.id : '',
      reason: props.initialValue ? props.initialValue.reason : '',
      startDateMoment: props.initialValue ? moment(props.initialValue.startDateStr) : moment(),
      endDateMoment: props.initialValue ? moment(props.initialValue.endDateStr) : moment(),
    };

    this.onReasonChange = (e) => this.setState({ reason: e.target.value });
    this.onDateRangeChange = ([startDateMoment, endDateMoment]) => this.setState({ startDateMoment, endDateMoment });
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit() {
    const { id, reason, startDateMoment, endDateMoment } = this.state;

    const { ownerId } = this.props;
    const leave = {
      id,
      reason,
      startDateStr: startDateMoment.format('YYYY-MM-DD'),
      endDateStr: endDateMoment.format('YYYY-MM-DD'),
    }
    this.props.onSubmit(ownerId, leave);
    this.props.onCancel();
  }

  render() {
    const { reason, startDateMoment, endDateMoment } = this.state;
    const { initialValue, onCancel } = this.props;

    return (
      <Modal
        visible={true}
        title={`${initialValue ? '修改' : '新增'}请假`}
        onCancel={onCancel}
        onOk={this.onSubmit}
      >
        <div>
          <Input placeholder="请假理由" value={reason} onChange={this.onReasonChange}/>
        </div>
        <div>
          <DatePicker.RangePicker value={[startDateMoment, endDateMoment]} onChange={this.onDateRangeChange}/>
        </div>
      </Modal>
    );
  }
}

EditLeaveModal.propTypes = {
  ownerId: PropTypes.string,
  initialValue: PropTypes.shape({
    id: PropTypes.string,
    startDateStr: PropTypes.string,
    endDateStr: PropTypes.string,
    reason: PropTypes.string,
  }),
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
}

export default EditLeaveModal;
