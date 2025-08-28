import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const departmentOptions = ["SET Design", "CAD Design", "Render"];
const employmentTypes = ["Full-time", "Part-time"];

const CreateEmployeeProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const [managers, setManagers] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const initialValues = {
    full_name: "",
    username: "",
    password: "",
    cnf_password: "",
    email: "",
    phone: "",
    home_address: "",
    dob: "",
    department: "",
    designation: "",
    employment_type: "",
    reporting_manager: "",
    date_of_joining: "",
    monthly_salary: "",
    emergency_contact: "",
    capacity: "",
    is_manager: false,
    profile_pic: null,
  };

  const validationSchema = Yup.object().shape({
    full_name: Yup.string().required("Full name is required"),
    username: Yup.string()
      .matches(/^[a-zA-Z0-9_-]+$/, {
        message:
          "Username can only contain letters, numbers, underscores (_) and dashes (-).",
      })
      .required("Username is required")
      .test(
        "checkDuplicateUsername",
        "Username already exists. Please choose another.",
        async function (value) {
          if (!value) return true;
          try {
            const res = await axios.post(
              `${process.env.REACT_APP_API_URL}/api/employee/check-username`,
              { username: value }
            );
            return res.data.available;
          } catch (err) {
            console.error("Error checking username", err);
            return this.createError({
              message: "Server error validating username",
            });
          }
        }
      ),
    password: Yup.string()
      .required("Password is required")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
      ),
    cnf_password: Yup.string()
      .required("Confirm Password is required")
      .oneOf([Yup.ref("password"), null], "Passwords must match"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
    home_address: Yup.string().required("Address is required"),
    dob: Yup.string().required("Date of birth is required"),
    department: Yup.string().required("Department is required"),
    designation: Yup.string().required("Designation is required"),
    employment_type: Yup.string().required("Employment type is required"),
    reporting_manager: Yup.string().nullable(),
    date_of_joining: Yup.string().required("Date of joining is required"),
    monthly_salary: Yup.number()
      .typeError("Must be a number")
      .required("Monthly salary is required"),
    is_manager: Yup.boolean(),
  });

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/employee/managers`)
      .then((res) => {
        if (res.data.success) setManagers(res.data.data);
      })
      .catch((err) => console.error("Error fetching managers", err));
  }, []);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/designation/get-all`)
      .then((res) => {
        if (res.data.success) setDesignations(res.data.designations);
      })
      .catch((err) => console.error("Error fetching designations", err));
  }, []);

  const handleFileChange = (e, setFieldValue) => {
    if (e.target.files[0]) {
      setProfilePreview(e.target.files[0]);
      setFieldValue("profile_pic", e.target.files[0]);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (key !== "profile_pic" && val !== null) {
          formData.append(key, typeof val === "boolean" ? val.toString() : val);
        }
      });

      if (profilePreview && typeof profilePreview !== "string") {
        formData.append("profile_pic", profilePreview);
      }

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/employee/add`,
        formData
      );

      if (res.data.success) {
        toast.success("Employee created successfully!");
        resetForm();
        navigate("/employee/dashboard");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error("Failed to create employee:", err);
      toast.error("Failed to create employee");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 bg-gray-100 border border-gray-300 rounded-lg mr-4 hover:bg-gray-200 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">
            Add New Employee
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values }) => (
            <Form className="space-y-6">
              <div className="">
                <div className="flex flex-col items-center">
                  <label
                    htmlFor="profilePic"
                    className="cursor-pointer w-32 h-32 rounded-full border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center bg-gray-100 mb-4"
                  >
                    {profilePreview ? (
                      <img
                        src={
                          typeof profilePreview === "string"
                            ? profilePreview
                            : URL.createObjectURL(profilePreview)
                        }
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <svg
                          className="w-12 h-12 text-gray-400 mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <span className="text-sm text-gray-500">
                          Upload Photo
                        </span>
                      </div>
                    )}
                  </label>
                  <input
                    type="file"
                    id="profilePic"
                    hidden
                    onChange={(e) => handleFileChange(e, setFieldValue)}
                  />
                  <p className="text-gray-500 text-sm">JPG, PNG (Max 5MB)</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Profile Image and Basic Info */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <Field
                      name="full_name"
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <ErrorMessage
                      name="full_name"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <Field
                      type="text"
                      name="username"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <ErrorMessage
                      name="username"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter password"
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="cnf_password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirm password"
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                    <ErrorMessage
                      name="cnf_password"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Field
                      type="email"
                      name="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <Field
                      type="text"
                      name="phone"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <ErrorMessage
                      name="phone"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Home Address
                    </label>
                    <Field
                      type="text"
                      name="home_address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <ErrorMessage
                      name="home_address"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <Field
                      type="date"
                      name="dob"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <ErrorMessage
                      name="dob"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                </div>

                {/* Right Column - Additional Information */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <Field
                      as="select"
                      name="department"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departmentOptions.map((dept, idx) => (
                        <option key={idx} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="department"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Designation
                    </label>
                    <Field
                      as="select"
                      name="designation"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Designation</option>
                      {designations.map((designation, idx) => (
                        <option key={idx} value={designation.name}>
                          {designation.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="designation"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employment Type
                    </label>
                    <Field
                      as="select"
                      name="employment_type"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Employment Type</option>
                      {employmentTypes.map((type, idx) => (
                        <option key={idx} value={type}>
                          {type}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="employment_type"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reporting Manager
                    </label>
                    <Field
                      as="select"
                      name="reporting_manager"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Reporting Manager</option>
                      {managers.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.full_name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="reporting_manager"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Joining
                    </label>
                    <Field
                      type="date"
                      name="date_of_joining"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <ErrorMessage
                      name="date_of_joining"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Salary
                    </label>
                    <Field
                      type="number"
                      name="monthly_salary"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <ErrorMessage
                      name="monthly_salary"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact
                    </label>
                    <Field
                      type="text"
                      name="emergency_contact"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <ErrorMessage
                      name="emergency_contact"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity (Hours/Week)
                    </label>
                    <Field
                      type="number"
                      name="capacity"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <ErrorMessage
                      name="capacity"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div className="flex items-center">
                    <Field
                      type="checkbox"
                      name="is_manager"
                      id="is_manager"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="is_manager"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Is Reporting Manager
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="reset"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Employee
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateEmployeeProfile;
