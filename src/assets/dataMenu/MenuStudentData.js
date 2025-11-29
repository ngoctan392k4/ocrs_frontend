export const menu_student = [
  {
    label: "Home",
    to: "/",
    children: [
      {
        label: "Homepage",
        to: "/homepageStudent",
      }
    ]
  },
  {
    label: "Course Registration",
    to: "/",
    children: [
      {
        label: "Available Course",
        to: "/availableCourse"
      },
      {
        label: "Register",
        to: "/register"
      },
      {
        label: "Registered Class",
        to: "/registeredClass"
      },
    ],
  },
  {
    label: "View Schedule",
    to: "/",
    children: [
      {
        label: "View Study Schedule",
        to: "/studySchedule"
      },
    ],
  },
  {
    label: "Study",
    to: "/",
    children: [
      {
        label: "Overall Transcript",
        to: "/overallTranscript"
      },
      {
        label: "Detailed Transcript",
        to: "/detailedTranscript"
      },
    ],
  },
  {
    label: "Payment",
    to: "/",
    children: [
      {
        label: "Pay tuition fee",
        to: "/payFee"
      },
      {
        label: "Payment History",
        to: "/paymentHistory"
      },
    ],
  },
  {
    label: "Log out",
    isLogout: true
  }

];

export default menu_student;