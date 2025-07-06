export default function InputField({ label, name, value, onChange, type = "text", error }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border rounded ${error ? "border-red-500" : "border-gray-300"}`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
