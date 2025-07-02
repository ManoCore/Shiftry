import React from "react";

export default function PasswordField({
  label = "Password",
  name = "password",
  value,
  onChange,
  show,
  toggle,
  placeholder = "********",
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="mt-1 w-full border border-gray-300 rounded px-4 py-2 pr-10"
          required
          data-testid={`input-${name}`}
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-600"
          data-testid="toggle-password"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
