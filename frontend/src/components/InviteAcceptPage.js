import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api"; 

export default function InviteAcceptPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const res = await axios.get(`/invite/${token}`);
        setUser(res.data);
      } catch (err) {
        setError("Invalid or expired invite link.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvite();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setSubmitting(true);
    setError("");

    try {
      await axios.post("/accept-invite", { token, password });
      setSuccess(true);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to accept invite. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="text-red-600 p-6">{error}</div>;

  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-10 text-center">
        <h2 className="text-xl font-semibold mb-2">🎉 Welcome, {user.firstName}!</h2>
        <p>Your account has been activated.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-1">Hi {user.firstName} 👋</h2>
      <p className="text-sm text-gray-600 mb-4">
        You’ve been invited to join as <strong>{user.role}</strong>. To activate your account,
        please set a password.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          disabled={submitting}
        >
          {submitting ? "Activating..." : "Accept Invite"}
        </button>
      </form>
    </div>
  );
}
