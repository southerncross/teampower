export const ROLE = {
  MANAGER: '负责人',
  FULLTIME: '全职',
  PARTTIME: '兼职',
  NEWBIE: '新人',
  INTERN: '实习生',
};

export const ROLE_TO_FACTOR = {
  [ROLE.MANAGER]: 0.4,
  [ROLE.FULLTIME]: 1.0,
  [ROLE.PARTTIME]: 0.5,
  [ROLE.NEWBIE]: 0.4,
  [ROLE.INTERN]: 0.2,
};

export const NATIONAL_HOLIDAYS = [
  { date: '2018-01-01', type: '放假', name: '元旦' },
  { date: '2018-02-11', type: '上班', name: '春节' },
  { date: '2018-02-15', type: '放假', name: '春节' },
  { date: '2018-02-16', type: '放假', name: '春节' },
  { date: '2018-02-17', type: '放假', name: '春节' },
  { date: '2018-02-18', type: '放假', name: '春节' },
  { date: '2018-02-19', type: '放假', name: '春节' },
  { date: '2018-02-20', type: '放假', name: '春节' },
  { date: '2018-02-21', type: '放假', name: '春节' },
  { date: '2018-02-24', type: '上班', name: '春节' },
  { date: '2018-04-05', type: '放假', name: '清明节' },
  { date: '2018-04-06', type: '放假', name: '清明节' },
  { date: '2018-04-07', type: '放假', name: '清明节' },
  { date: '2018-04-08', type: '上班', name: '清明节' },
  { date: '2018-04-28', type: '上班', name: '劳动节' },
  { date: '2018-04-29', type: '放假', name: '劳动节' },
  { date: '2018-04-30', type: '放假', name: '劳动节' },
  { date: '2018-05-01', type: '放假', name: '劳动节' },
  { date: '2018-06-18', type: '放假', name: '端午节' },
  { date: '2018-09-24', type: '放假', name: '中秋节' },
  { date: '2018-09-29', type: '上班', name: '国庆节' },
  { date: '2018-09-30', type: '上班', name: '国庆节' },
  { date: '2018-10-01', type: '放假', name: '国庆节' },
  { date: '2018-10-02', type: '放假', name: '国庆节' },
  { date: '2018-10-03', type: '放假', name: '国庆节' },
  { date: '2018-10-04', type: '放假', name: '国庆节' },
  { date: '2018-10-05', type: '放假', name: '国庆节' },
  { date: '2018-10-06', type: '放假', name: '国庆节' },
  { date: '2018-10-07', type: '放假', name: '国庆节' },
];

export const COMPANY_HOLIDAYS = [
  { date: '2018-07-11', type: '放假', name: 'turboweek' },
  { date: '2018-07-12', type: '放假', name: 'turboweek' },
  { date: '2018-07-13', type: '放假', name: 'turboweek' },
  { date: '2018-07-14', type: '放假', name: 'turboweek' },
];

export const LS_TEAM_MEMBERS = 'LS_TEAM_MEMBERS';
export const LS_DATE_RANGE = 'LS_DATE_RANGE';
