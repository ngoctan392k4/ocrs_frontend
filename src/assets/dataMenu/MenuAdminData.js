export const menu_admin = [
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
    label: "Course Management",
    to: "/",
    children: [
      {
        label: "Course Management",
        to: "/courseManagement"
      },
      {
        label: "Open Course",
        to: "/openCourse"
      },
    ],
  },
  {
    label: "Class Management",
    to: "/",
    children: [
      {
        label: "Class Management",
        to: "/classManagement"
      },
    ],
  },
  {
    label: "Account Management",
    to: "/",
    children: [
      {
        label: "Account Management",
        to: "/accountManagement"
      },
    ],
  },
  {
    label: "Payment Management",
    to: "/",
    children: [
      {
        label: "Payment Tracking",
        to: "/paymentTracking"
      },
    ],
  },
  {
    label: "Log out",
    isLogout: true
  }

];

export default menu_admin;