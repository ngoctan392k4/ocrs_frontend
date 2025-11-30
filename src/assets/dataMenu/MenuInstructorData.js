export const menu_instructor = [
  {
    label: "Home",
    to: "/",
    children: [
      {
        label: "Homepage",
        to: "/homepageAdmin",
      }
    ]
  },
  {
    label: "View Schedule",
    to: "/",
    children: [
      {
        label: "View Teaching Schedule",
        to: "/teachingSchedule"
      },
    ],
  },
  {
    label: "Teaching",
    to: "/",
    children: [
      {
        label: "My Classes",
        to: "/myClasses"
      },
      {
        label: "Grade Management",
        to: "/gradeManagement"
      },
    ],
  },
  {
    label: "Log out",
    isLogout: true
  }
];

export default menu_instructor;