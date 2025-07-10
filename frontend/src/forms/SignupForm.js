// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import InputField from "../forms/InputField";
// import PasswordField from "../forms/PasswordField";
// import { signupUser } from "../api";

// export default function SignupForm() {
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     emailId: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [apiError, setApiError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [successMessage, setSuccessMessage] = useState(null); 

//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: null }));
//     }
//     setApiError(null);
//     setSuccessMessage(null); 
//   };

//   const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.firstName.trim()) {
//       newErrors.firstName = "First Name is required.";
//     }
//     if (!formData.lastName.trim()) {
//       newErrors.lastName = "Last Name is required.";
//     }
//     if (!formData.emailId) {
//       newErrors.emailId = "Email Address is required.";
//     } else if (!/\S+@\S+\.\S+/.test(formData.emailId)) {
//       newErrors.emailId = "Email Address is invalid.";
//     }
//     if (!formData.password) {
//       newErrors.password = "Password is required.";
//     } else if (formData.password.length < 8) {
//       newErrors.password = "Password must be at least 8 characters.";
//     }
//     if (!formData.confirmPassword) {
//       newErrors.confirmPassword = "Please confirm your password.";
//     } else if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = "Passwords do not match.";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setApiError(null);
//     setSuccessMessage(null); 
//     setLoading(true);

//     const isValid = validateForm();

//     if (isValid) {
//       try {
//         const { confirmPassword, ...dataToSend } = formData;
//         const res = await signupUser(dataToSend);

//         if (res.data?.success || res.status === 200 || res.status === 201) {
//           const msg = res.data?.message || "Signup successful! Redirecting to login...";
//           setSuccessMessage(msg); 
          
//           setTimeout(() => {
//             navigate('/login');
//           }, 2000); 

//         } else {
//           setApiError(res.data?.message || "Signup failed. Please try again.");
//         }
//       } catch (err) {
//         const errorMessage =
//           err.response?.data?.message ||
//           "An unexpected error occurred during signup. Please try again.";
//         setApiError(errorMessage);
//         console.error("Signup error:", err);
//       } finally {
//         setLoading(false);
//       }
//     } else {
//       setLoading(false);
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="w-full max-w-md space-y-6"
//       data-testid="signup-form"
//     >
      
//       {apiError && (
//         <div
//           className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
//           role="alert"
//         >
//           <span className="block sm:inline">{apiError}</span>
//         </div>
//       )}

//       {/* Display success message */}
//       {successMessage && (
//         <div
//           className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
//           role="alert"
//         >
//           <span className="block sm:inline">{successMessage}</span>
//         </div>
//       )}

//       <InputField
//         label="First Name"
//         name="firstName"
//         value={formData.firstName}
//         onChange={handleChange}
//         placeholder="Enter first name"
//         error={errors.firstName}
//         disabled={loading || !!successMessage} 
//       />
//       <InputField
//         label="Last Name"
//         name="lastName"
//         value={formData.lastName}
//         onChange={handleChange}
//         placeholder="Enter last name"
//         error={errors.lastName}
//         disabled={loading || !!successMessage}
//       />
//       <InputField
//         label="Email Address"
//         name="emailId"
//         type="email"
//         value={formData.emailId}
//         onChange={handleChange}
//         placeholder="example@gmail.com"
//         error={errors.emailId}
//         disabled={loading || !!successMessage}
//       />
//       <PasswordField
//         label="Password"
//         name="password"
//         value={formData.password}
//         onChange={handleChange}
//         show={showPassword}
//         toggle={togglePasswordVisibility}
//         error={errors.password}
//         disabled={loading || !!successMessage}
//       />
//       <PasswordField
//         label="Confirm Password"
//         name="confirmPassword"
//         value={formData.confirmPassword}
//         onChange={handleChange}
//         show={showPassword}
//         toggle={togglePasswordVisibility}
//         error={errors.confirmPassword}
//         disabled={loading || !!successMessage}
//       />

//       <button
//         type="submit"
//         className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//         data-testid="submit-button"
//         disabled={loading || !!successMessage} 
//       >
//         {loading ? "Registering..." : (successMessage ? "Success!" : "Sign up")}
//       </button>

//       <p className="text-center text-gray-600 text-sm mt-4">
//         Already have an account?{" "}
//         <button
//           type="button"
//           onClick={() => navigate('/login')}
//           className="text-blue-600 hover:text-blue-800 font-bold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
//           disabled={loading || !!successMessage} 
//         >
//           Login here.
//         </button>
//       </p>
//     </form>
//   );
// }



import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../forms/InputField";
import PasswordField from "../forms/PasswordField";
import { signupUser } from "../api";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null); 

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    setApiError(null);
    setSuccessMessage(null); 
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First Name is required.";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last Name is required.";
    }
    if (!formData.emailId) {
      newErrors.emailId = "Email Address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.emailId)) {
      newErrors.emailId = "Email Address is invalid.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (!formData.organizationName.trim()) {
            newErrors.organizationName = "Organization Name is required.";
        }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);
        setSuccessMessage(null);
        setLoading(true);

        const isValid = validateForm();

        if (isValid) {
            try {
                // Destructure confirmPassword and include organizationName in dataToSend
                const { confirmPassword, ...dataToSend } = formData;
                const res = await signupUser(dataToSend);

                if (res.data?.success || res.status === 200 || res.status === 201) {
                    const msg = res.data?.message || "Signup successful! Redirecting to login...";
                    setSuccessMessage(msg);

                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);

                } else {
                    setApiError(res.data?.message || "Signup failed. Please try again.");
                }
            } catch (err) {
                const errorMessage =
                    err.response?.data?.message ||
                    "An unexpected error occurred during signup. Please try again.";
                setApiError(errorMessage);
                console.error("Signup error:", err);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };


  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-6"
      data-testid="signup-form"
    >
      
      {apiError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{apiError}</span>
        </div>
      )}

      {/* Display success message */}
      {successMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      <InputField
        label="First Name"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        placeholder="Enter first name"
        error={errors.firstName}
        disabled={loading || !!successMessage} 
      />
      <InputField
        label="Last Name"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        placeholder="Enter last name"
        error={errors.lastName}
        disabled={loading || !!successMessage}
      />
      <InputField
        label="Email Address"
        name="emailId"
        type="email"
        value={formData.emailId}
        onChange={handleChange}
        placeholder="example@gmail.com"
        error={errors.emailId}
        disabled={loading || !!successMessage}
      />
      <PasswordField
        label="Password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        show={showPassword}
        toggle={togglePasswordVisibility}
        error={errors.password}
        disabled={loading || !!successMessage}
      />
      <PasswordField
        label="Confirm Password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        show={showPassword}
        toggle={togglePasswordVisibility}
        error={errors.confirmPassword}
        disabled={loading || !!successMessage}
      />
      <InputField
                label="Organization Name"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                placeholder="Enter your organization's name"
                error={errors.organizationName}
                disabled={loading || !!successMessage}
            />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="submit-button"
        disabled={loading || !!successMessage} 
      >
        {loading ? "Registering..." : (successMessage ? "Success!" : "Sign up")}
      </button>

      <p className="text-center text-gray-600 text-sm mt-4">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-blue-600 hover:text-blue-800 font-bold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !!successMessage} 
        >
          Login here.
        </button>
      </p>
    </form>
  );
}