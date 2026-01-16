# Online Course Registration System
## Table of Contents
- [Online Course Registration System](#online-course-registration-system)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [❓Problem Description](#problem-description)
  - [🚀 Frontend Scope](#-frontend-scope)
  - [🎯 Project Objectives](#-project-objectives)
  - [✨ Key Features](#-key-features)
    - [Student](#student)
    - [Instructor](#instructor)
    - [Admin](#admin)
    - [System](#system)
  - [📝 Installation \& Setup](#-installation--setup)
    - [Prerequisites](#prerequisites)
    - [Frontend Setup](#frontend-setup)

## Overview
The OCRS Frontend is a React-based web application that provides a friendly user interface for the Online Course Registration System at XYZ University. It enables students, instructors, and administrators to interact with the course registration platform through a user-friendly interface.

## ❓Problem Description
- At XYZ University, the current course registration process is paper-based and manual. 
- Students must fill out registration forms and submit them to the academic office. Staff then manually enter the data into the management system to create individual study schedules.
- The critical challenges:
  - **Manual & Paper-Based**: Students must fill out physical forms
  - **Time-Consuming**: Process takes several days to complete
  - **Error-Prone**: High risk of human errors
  - **Scheduling Conflicts**: Difficult to detect and manage conflicts
=> To solve these issues, the university made the decision to develop an Online Course Registration System that allows students, instructors, and administrators to manage course registration efficiently through a web-based system.

## 🚀 Frontend Scope
- User interaction and experience (UI/UX)
- Displaying course information
- Handling user actions such as course registration, add/drop, payment, and grade management
- Communicating with the backend via RESTful APIs

## 🎯 Project Objectives
- Allow students to search, register, add/drop courses online 
- Automatically manage class capacity and scheduling conflicts
- Automatically cancel classes if they do not have enough students to open
- Handle alternative courses when a class is canceled
- Support online payment and invoice generation
- Enable instructors to manage classes and enter grades
- Provide smart course recommendations and timetable suggestions
- Reduce manual work and improve accuracy and efficiency

## ✨ Key Features
### Student
- **Available Course Check**: Search and filter available courses
- **Course Registration**: Register, add, or drop courses during add/ drop period
- **Alternative Courses**: Select alternatives when classes are cancelled
- **Transcript Viewing**: View academic results
- **Online Payment**: Pay tuition via QR code
- **Payment History**: Track payment records and invoices
- **Smart Timetable**: Suggest classes without scheduling conflicts with registered classes
- **AI Chatbot**: Get assistance for course registration questions
- **Smart Recommendations**: Receive personalized course suggestions

### Instructor
- **Teaching Schedule**: View assigned class times and locations
- **Student Management**: View student lists for each class
- **Grade Management**: Enter and manage student grades

### Admin
- **Admin Dashboard**: University Performance
- **Account Management**: Create, edit, and deactivate user accounts
- **Class Management**: Create, edit, and delete classes and schedules
- **Course Management**: Create, edit, and delete courses
- **Course Opening**: Open courses for upcoming semester
- **Payment Tracking**: Monitor all students' payment

### System
- **Automation**: Automatic class cancellation (less than 10 students)
- **Authentication**: Secure login
- **Role-Based Access**: Access Management based on users' role
- **Password Recovery**: Password reset


## 📝 Installation & Setup
### Prerequisites
- Git
- Node.js 
- npm
- PostgreSQL Database
- PgAdmin/ DBeaver (any Database Management System)

### Frontend Setup
- Step 1: Install dependencies with the following bash
```shell
    npm install
```
- Step 2: Running the frontend with the following bash
```shell
    npm run dev
```