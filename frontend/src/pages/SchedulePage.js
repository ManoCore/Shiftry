import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  addLocation,
  createSchedulesBatch,
  deleteSchedule,
  fetchAllUsers,
  fetchLocations,
  fetchSchedulesInRange,
  publishSchedules,
  updateSchedule,

} from '../api';
import { useAuth } from '../context/AuthContext';

const NOTIFICATION_EVENT = 'new-notification';

const AssignmentModal = ({ isOpen, onClose, assignment, dayDate, availableLocations, defaultLocation, availableCareWorkers, onSave, onDelete, schedules, pendingSchedules, isAdmin }) => {
  const [formData, setFormData] = useState({
    id: assignment?.id || uuidv4(),
    start: assignment?.start || '',
    end: assignment?.end || '',
    description: assignment?.description || '',
    careWorkers: assignment?.careWorkers || [],
    location: defaultLocation || availableLocations?.[0]?.name || 'Time Off',
    breakDuration: assignment?.breakDuration ?? 0,
  });
  const [error, setError] = useState('');
  const [isCareWorkerDropdownOpen, setIsCareWorkerDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (assignment) {
        setFormData({
          id: assignment.id || uuidv4(),
          start: assignment.start || '',
          end: assignment.end || '',
          description: assignment.description || '',
          careWorkers: assignment.careWorkers || [],
          location: assignment.location || defaultLocation || availableLocations?.[0]?.name || 'Time Off',
          breakDuration: assignment?.breakDuration ?? 0,
        });
      } else {
        setFormData({
          id: uuidv4(),
          start: '',
          end: '',
          description: '',
          careWorkers: [],
          location: defaultLocation || availableLocations?.[0]?.name || 'Time Off',
          breakDuration: 0,
        });
      }
      setError('');
      setIsCareWorkerDropdownOpen(false);
    }
  }, [isOpen, assignment, defaultLocation, availableLocations]);

  const locationsWithWorkType = useMemo(() => {
    return (availableLocations || []).map(loc => ({
      ...loc,
      workType: loc.workType || ''
    }));
  }, [availableLocations]);

  const scheduledCareWorkerIds = useMemo(() => {
    const scheduledIds = new Set();
    const daySchedules = [...schedules, ...pendingSchedules].filter(s => s.date === dayDate && s.id !== formData.id);
    daySchedules.forEach(schedule => {
      (schedule.careWorkers || []).forEach(id => scheduledIds.add(id));
    });
    return scheduledIds;
  }, [dayDate, schedules, pendingSchedules, formData.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'careWorker') {
      setFormData(prev => ({
        ...prev,
        careWorkers: checked
          ? [...prev.careWorkers, value]
          : prev.careWorkers.filter(id => id !== value),
      }));
    } else if (name === 'breakDuration') {
      setFormData(prev => ({
        ...prev,
        breakDuration: Number(value),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    setError('');
  };

  const handleSubmit = (e) => {
  e.preventDefault();
 
  console.log('formData before submission:', formData); // Now this should show a number for breakDuration
 
  // --- Validations (your existing code) ---
  if (!formData.start || !formData.end) {
    setError('Start and end times are required');
    return;
  }
  if (formData.start >= formData.end) {
    setError('End time must be after start time');
    return;
  }
  if (!formData.careWorkers.length) {
    setError('Please select at least one care worker');
    return;
  }
  if (!formData.location) {
    setError('Location is required');
    return;
  }
 
  // --- Simplified break handling ---
  // formData.breakDuration should already be a number (0, 20, 30, 40)
  // due to the changes in useState initialization and handleChange.
  const numericBreak = formData.breakDuration;
 
  // Ensure it's a valid number just in case (defensive programming)
  if (typeof numericBreak !== 'number' || isNaN(numericBreak) || numericBreak < 0) {
      console.error("breakDuration is not a valid number:", numericBreak);
      setError('Invalid break duration. Please select a valid option.');
      return;
  }
 
 
  // --- Your newSchedules construction using numericBreak ---
  const newSchedules = formData.careWorkers.map(careWorkerId => ({
    id: assignment && formData.careWorkers.length === 1 ? formData.id : uuidv4(),
    start: formData.start,
    end: formData.end,
    description: formData.description,
    careWorkers: [careWorkerId],
    careWorker: availableCareWorkers.find(w => w._id === careWorkerId)?.name || 'Unknown',
    location: formData.location,
    date: dayDate,
    // --- THIS IS THE LINE THAT USES THE PREPARED VALUE ---
    break: numericBreak, // This 'break' field now gets the guaranteed number
    isPublished: assignment?.isPublished || false,
    originalScheduleId: assignment?.originalScheduleId,
  }));
 
  // --- Crucial Debugging Log ---
  console.log('Final payload (newSchedules) being sent:', newSchedules);
 
  onSave(newSchedules);
  onClose();
};

  const handleDeleteClick = () => {
    onDelete(assignment);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCareWorkerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const today = new Date().toISOString().split('T')[0];
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-full sm:max-w-md h-full sm:h-auto overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            {assignment ? (isAdmin ? 'Edit Schedule' : 'View Schedule') : 'Add New Schedule'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl leading-none"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* <div className="mb-3 sm:mb-4 relative" ref={dropdownRef}>
            <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1">
              Care Workers
            </label>
            <div
              className="w-full p-2 border border-gray-300 rounded-md cursor-pointer bg-white flex justify-between items-center text-xs sm:text-sm"
              onClick={() => isAdmin && setIsCareWorkerDropdownOpen(!isCareWorkerDropdownOpen)}
            >
              <span className="truncate">
                {formData.careWorkers.length > 0
                  ? formData.careWorkers
                      .map(id => availableCareWorkers.find(w => w._id === id)?.name)
                      .filter(Boolean)
                      .join(', ') || 'Select Care Workers'
                  : 'Select Care Workers'}
              </span>
              {isAdmin && (
                <svg
                  className={`w-3 sm:w-4 h-3 sm:h-4 text-gray-500 transform ${isCareWorkerDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              )}
            </div>
            {isCareWorkerDropdownOpen && isAdmin && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-32 sm:max-h-40 overflow-y-auto">
                {availableCareWorkers.map((worker) => (
                  <label
                    key={worker._id}
                    className="flex items-center px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name="careWorker"
                      value={worker._id}
                      checked={formData.careWorkers.includes(worker._id)}
                      onChange={handleChange}
                      disabled={scheduledCareWorkerIds.has(worker._id) && !formData.careWorkers.includes(worker._id)}
                      className="form-checkbox h-3 sm:h-4 w-3 sm:w-4 text-blue-600"
                    />
                    <span className="ml-2 truncate">{worker.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div> */}

          <div className="mb-3 sm:mb-4 relative" ref={dropdownRef}>
  <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1">
    Care Workers
  </label>
  <div
    className="w-full p-2 border border-gray-300 rounded-md cursor-pointer bg-white flex justify-between items-center text-xs sm:text-sm"
    onClick={() => {
      console.log('Available Care Workers:', availableCareWorkers); // Log full array
      console.log('Unique Roles:', [...new Set(availableCareWorkers.map(w => w.role || 'undefined'))]); // Log unique role values
      console.log('Workers with Roles:', availableCareWorkers.map(w => ({ id: w._id, name: w.name, role: w.role || 'undefined' }))); // Log each worker's role
      isAdmin && setIsCareWorkerDropdownOpen(!isCareWorkerDropdownOpen);
    }}
  >
    <span className="truncate">
      {formData.careWorkers.length > 0
        ? formData.careWorkers
            .map(id => {
              const worker = availableCareWorkers.find(w => w._id === id && w.role?.toLowerCase() === 'careworker');
              return worker ? worker.name : null;
            })
            .filter(Boolean)
            .join(', ') || 'Select Care Workers'
        : 'Select Care Workers'}
    </span>
    {isAdmin && (
      <svg
        className={`w-3 sm:w-4 h-3 sm:h-4 text-gray-500 transform ${isCareWorkerDropdownOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    )}
  </div>
  {isCareWorkerDropdownOpen && isAdmin && (
    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-32 sm:max-h-40 overflow-y-auto">
      {availableCareWorkers
        .filter(worker => worker.role?.toLowerCase() !== 'admin')
        .map((worker) => (
          <label
            key={worker._id}
            className="flex items-center px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <input
              type="checkbox"
              name="careWorker"
              value={worker._id}
              checked={formData.careWorkers.includes(worker._id)}
              onChange={handleChange}
              disabled={scheduledCareWorkerIds.has(worker._id) && !formData.careWorkers.includes(worker._id)}
              className="form-checkbox h-3 sm:h-4 w-3 sm:w-4 text-blue-600"
            />
            <span className="ml-2 truncate">{worker.name}</span>
          </label>
        ))}
    </div>
  )}
</div>
          
          <div className="mb-3 sm:mb-4">
            <label htmlFor="location" className="block text-gray-700 text-xs sm:text-sm font-medium mb-1">
              Location
            </label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              required
              disabled={!isAdmin}
            >
              <option value="" disabled>Select a Location</option>
              <option value="Time Off">Time Off</option>
              {locationsWithWorkType.map((loc) => (
                <option key={loc._id} value={loc.name}>
                  {loc.workType ? `${loc.workType} - ` : ''}{loc.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3 sm:mb-4">
            <label htmlFor="breakDuration" className="block text-gray-700 text-xs sm:text-sm font-medium mb-1">
              Break Duration
            </label>
            <select
              id="breakDuration"
              name="breakDuration"
              value={formData.breakDuration}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              required
              disabled={!isAdmin}
            >
              <option value="0" disabled>Select Break Duration</option>
              <option value="20">20 mins</option>
              <option value="30">30 mins</option>
              <option value="40">40 mins</option>
            </select>
          </div>
          <div className="mb-3 sm:mb-4">
            <label htmlFor="start" className="block text-gray-700 text-xs sm:text-sm font-medium mb-1">
              Start Time
            </label>
            <input
              type="time"
              id="start"
              name="start"
              value={formData.start}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              required
              disabled={!isAdmin}
            />
          </div>
          <div className="mb-3 sm:mb-4">
            <label htmlFor="end" className="block text-gray-700 text-xs sm:text-sm font-medium mb-1">
              End Time
            </label>
            <input
              type="time"
              id="end"
              name="end"
              value={formData.end}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              required
              disabled={!isAdmin}
            />
          </div>
          {error && (
            <div className="mb-3 sm:mb-4 text-red-500 text-xs sm:text-sm">{error}</div>
          )}
          <div className="mb-3 sm:mb-4">
            <label htmlFor="description" className="block text-gray-700 text-xs sm:text-sm font-medium mb-1">
              Description of Work
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              placeholder="e.g., Medication assistance, meal preparation, light cleaning."
              disabled={!isAdmin}
            ></textarea>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 sm:mt-6 gap-2">
            {assignment && isAdmin && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-md transition-colors duration-200 text-xs sm:text-sm w-full sm:w-auto"
                disabled={!isAdmin}
              >
                Delete
              </button>
            )}
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-md transition-colors duration-200 text-xs sm:text-sm flex-1 sm:flex-none"
              >
                Cancel
              </button>
              {isAdmin && (
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-md transition-colors duration-200 text-xs sm:text-sm flex-1 sm:flex-none"
                  disabled={!isAdmin}
                >
                  Save Schedule
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const NewAreaModal = ({ isOpen, onClose, availableCareWorkers, setLocations }) => {
  const [formData, setFormData] = useState({
    name: '',
    workType: '',
    preferredTeamMember: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.workType) {
      setError('Name and Work Type are required');
      return;
    }
    try {
      const newLocation = {
        name: formData.name,
        workType: formData.workType,
        preferredTeamMember: formData.preferredTeamMember || null,
        address: { street: '', city: '' },
      };
      await addLocation(newLocation);
      const locationsResponse = await fetchLocations();
      setLocations(locationsResponse.data || []);
      onClose();
    } catch (err) {
      console.error('Error saving location:', err);
      setError(err.response?.data?.msg || 'Failed to save location');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-full sm:max-w-md h-full sm:h-auto overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Add New Location/Area</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl leading-none"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 sm:mb-4">
            <label htmlFor="name" className="block text-gray-700 text-xs sm:text-sm font-medium mb-1">
              Location/Area Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              required
            />
          </div>
          <div className="mb-3 sm:mb-4">
            <label htmlFor="workType" className="block text-gray-700 text-xs sm:text-sm font-medium mb-1">
              Work Type
            </label>
            <select
              id="workType"
              name="workType"
              value={formData.workType}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              required
            >
              <option value="">Select a Work Type</option>
              <option value="Support Worker">Support Worker</option>
              <option value="Nurse">Nurse</option>
              <option value="Non-Working">Non-Working</option>
            </select>
          </div>
          <div className="mb-3 sm:mb-4">
            <label htmlFor="preferredTeamMember" className="block text-gray-700 text-xs sm:text-sm font-medium mb-1">
              Preferred Team Member
            </label>
            <select
              id="preferredTeamMember"
              name="preferredTeamMember"
              value={formData.preferredTeamMember}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
            >
              <option value="">Select a Team Member (Optional)</option>
              {availableCareWorkers.map((worker) => (
                <option key={worker._id} value={worker._id}>
                  {worker.name}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <div className="mb-3 sm:mb-4 text-red-500 text-xs sm:text-sm">{error}</div>
          )}
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm w-full sm:w-auto"
            >
              Save Location/Area
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-full sm:max-w-sm h-full sm:h-auto overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Confirm Deletion</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl leading-none"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <p className="text-gray-700 text-xs sm:text-sm mb-4 sm:mb-6">
          Are you sure you want to delete this schedule? This action cannot be undone.
        </p>
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm w-full sm:w-auto"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmPublishModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-full sm:max-w-sm h-full sm:h-auto overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Confirm Publish</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl leading-none"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <p className="text-gray-700 text-xs sm:text-sm mb-4 sm:mb-6">
          Are you sure you want to publish these schedules? This action will make them visible to all relevant team members.
        </p>
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm w-full sm:w-auto"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [pendingSchedules, setPendingSchedules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewAreaModalOpen, setIsNewAreaModalOpen] = useState(false);
  const [isConfirmPublishModalOpen, setIsConfirmPublishModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [modalDayDate, setModalDayDate] = useState(null);
  const [modalLocation, setModalLocation] = useState(null);
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysToMonday);
    return monday;
  });
  const [isHeaderLocationDropdownOpen, setIsHeaderLocationDropdownOpen] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [openLocationDropdowns, setOpenLocationDropdowns] = useState(new Set());
  const [error, setError] = useState(null);
  const [careWorkers, setCareWorkers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [scheduleFilters, setScheduleFilters] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, token, isLoading: isAuthLoading } = useAuth();

  // Ref to track if initial data has been fetched
  const initialFetchDone = useRef(false);

  const fetchInitialData = useCallback(async () => {
    if (!user || !user.id) {
      console.log('No user or user.id found', { user });
      setError('Please log in to view schedules');
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      // Fetch care workers and locations only if not already fetched
      if (!initialFetchDone.current) {
        const usersResponse = await fetchAllUsers();
        console.log('Fetched details of users : ',usersResponse)
        const fetchedCareWorkers = usersResponse.data.map(user => ({
          _id: user._id,
          name: user.name || `${user.firstName} ${user.lastName}`,
          role:user.access,
          
        }));
        console.log('Fetched care workers:', fetchedCareWorkers);
        setCareWorkers(fetchedCareWorkers);

        const locationsResponse = await fetchLocations();
        console.log('Fetched locations:', locationsResponse.data);
        setLocations(locationsResponse.data || []);
      }

      // Fetch schedules for the current week
      const start = new Date(weekStartDate);
      const end = new Date(weekStartDate);
      end.setDate(weekStartDate.getDate() + 6);
      const schedulesResponse = await fetchSchedulesInRange(start, end);
      console.log('Raw schedules response:', schedulesResponse.data);

      const transformedSchedules = [];
      schedulesResponse.data.forEach(schedule => {
        const scheduleLocation = schedule.location?.name || (typeof schedule.location === 'string' ? schedule.location : 'Time Off');
        if (!schedule.careWorker) {
          console.log(`Schedule ${schedule._id} has no careWorker`);
          if (user.role === 'admin') {
            transformedSchedules.push({
              id: schedule._id,
              start: schedule.start || '',
              end: schedule.end || '',
              description: schedule.description || '',
              careWorkers: [],
              careWorker: 'None',
              location: scheduleLocation,
              date: schedule.date || '',
              breakDuration: schedule.break ? `${schedule.break} mins` : '',
              isPublished: schedule.isPublished || false,
              originalScheduleId: schedule._id,
            });
          }
          return;
        }

        const careWorkerIds = Array.isArray(schedule.careWorker)
          ? schedule.careWorker.map(cw => cw._id || cw).filter(Boolean)
          : [schedule.careWorker?._id || schedule.careWorker].filter(Boolean);

        careWorkerIds.forEach(careWorkerId => {
          if (user.role !== 'admin' && careWorkerId !== user.id) {
            console.log(`Schedule ${schedule._id} skipped for non-admin: careWorkerId ${careWorkerId} does not match user.id ${user.id}`);
            return;
          }
          transformedSchedules.push({
            id: schedule._id + '-' + careWorkerId,
            start: schedule.start || '',
            end: schedule.end || '',
            description: schedule.description || '',
            careWorkers: [careWorkerId],
            careWorker: careWorkers.find(w => w._id === careWorkerId)?.name || 'Unknown',
            location: scheduleLocation,
            date: schedule.date || '',
            breakDuration: schedule.break ? `${schedule.break} mins` : '',
            isPublished: schedule.isPublished || false,
            originalScheduleId: schedule._id,
          });
        });
      });

      console.log('Transformed schedules:', transformedSchedules);
      setSchedules(transformedSchedules);
      setDataFetched(true);
      initialFetchDone.current = true; // Mark initial fetch as done
    } catch (err) {
      console.error('Error fetching initial data:', err);
      const message = err.response?.status === 401
        ? 'Not authorized. Please log in.'
        : err.response?.data?.msg || 'Failed to load data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user, weekStartDate, careWorkers]);

  // Fetch schedules for a specific week
  const fetchSchedulesForWeek = useCallback(async (startDate) => {
    try {
      setIsLoading(true);
      const start = new Date(startDate);
      const end = new Date(startDate);
      end.setDate(startDate.getDate() + 6);
      const schedulesResponse = await fetchSchedulesInRange(start, end);
      console.log('Raw schedules response:', schedulesResponse.data);

      const transformedSchedules = [];
      schedulesResponse.data.forEach(schedule => {
        const scheduleLocation = schedule.location?.name || (typeof schedule.location === 'string' ? schedule.location : 'Time Off');
        if (!schedule.careWorker) {
          console.log(`Schedule ${schedule._id} has no careWorker`);
          if (user.role === 'admin') {
            transformedSchedules.push({
              id: schedule._id,
              start: schedule.start || '',
              end: schedule.end || '',
              description: schedule.description || '',
              careWorkers: [],
              careWorker: 'None',
              location: scheduleLocation,
              date: schedule.date || '',
              breakDuration: schedule.break ? `${schedule.break} mins` : '',
              isPublished: schedule.isPublished || false,
              originalScheduleId: schedule._id,
            });
          }
          return;
        }

        const careWorkerIds = Array.isArray(schedule.careWorker)
          ? schedule.careWorker.map(cw => cw._id || cw).filter(Boolean)
          : [schedule.careWorker?._id || schedule.careWorker].filter(Boolean);

        careWorkerIds.forEach(careWorkerId => {
          if (user.role !== 'admin' && careWorkerId !== user.id) {
            console.log(`Schedule ${schedule._id} skipped for non-admin: careWorkerId ${careWorkerId} does not match user.id ${user.id}`);
            return;
          }
          transformedSchedules.push({
            id: schedule._id + '-' + careWorkerId,
            start: schedule.start || '',
            end: schedule.end || '',
            description: schedule.description || '',
            careWorkers: [careWorkerId],
            careWorker: careWorkers.find(w => w._id === careWorkerId)?.name || 'Unknown',
            location: scheduleLocation,
            date: schedule.date || '',
            breakDuration: schedule.break ? `${schedule.break} mins` : '',
            isPublished: schedule.isPublished || false,
            originalScheduleId: schedule._id,
          });
        });
      });

      console.log('Transformed schedules:', transformedSchedules);
      setSchedules(transformedSchedules);
      setError(null);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      const message = err.response?.status === 401
        ? 'Not authorized. Please log in.'
        : err.response?.data?.msg || 'Failed to load schedules';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user, careWorkers]);

  // Initial data fetch
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchInitialData();
    }
  }, [fetchInitialData]);

  // Update selected locations after initial data fetch
  useEffect(() => {
    if (dataFetched && !isLoading) {
      console.log('Post-fetch state update - Schedules:', schedules, 'Locations:', locations);
      if (user.role !== 'admin') {
        const userLocations = [...new Set(
          schedules
            .filter(s => s.careWorkers.includes(user.id))
            .map(s => {
              const loc = locations.find(loc => loc.name === s.location);
              if (!loc) {
                console.log(`No matching location found for schedule location: ${s.location}`);
                return null;
              }
              return loc._id;
            })
            .filter(Boolean)
        )];
        console.log('Auto-selected locations for non-admin:', userLocations);
        const newSelectedLocations = userLocations.length > 0 ? userLocations : ['time-off'];
        setSelectedLocations(newSelectedLocations);
        setOpenLocationDropdowns(new Set([userLocations[0] || 'time-off']));
        console.log('Set selectedLocations:', newSelectedLocations, 'openLocationDropdowns:', [...new Set([userLocations[0] || 'time-off'])]);
      } else {
        const defaultLocations = locations.length > 0 ? [locations[0]._id] : ['time-off'];
        setSelectedLocations(defaultLocations);
        setOpenLocationDropdowns(new Set([locations[0]?._id || 'time-off']));
        console.log('Set admin selectedLocations:', defaultLocations, 'openLocationDropdowns:', [locations[0]?._id || 'time-off']);
      }
    }
  }, [dataFetched, isLoading, schedules, locations, user]);

  const allAvailableAreas = useMemo(() => locations || [], [locations]);

  const currentVisibleLocations = useMemo(() => {
    const filteredLocations = (allAvailableAreas || []).filter((loc) => selectedLocations.includes(loc._id));
    return [
      { _id: 'time-off', name: 'Time Off', workType: '' },
      ...filteredLocations
    ];
  }, [allAvailableAreas, selectedLocations]);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + i);
    return {
      dateStr: date.toISOString().split('T')[0],
      display: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      shortDay: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
    };
  }), [weekStartDate]);

  const isAdmin = user && user.role === "admin";

  const weekRangeLabel = useCallback(() => {
    const start = new Date(weekStartDate);
    const end = new Date(weekStartDate);
    end.setDate(weekStartDate.getDate() + 6);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  }, [weekStartDate]);

  const handlePreviousWeek = useCallback((e) => {
    e.preventDefault();
    const newStartDate = new Date(weekStartDate);
    newStartDate.setDate(weekStartDate.getDate() - 7);
    setWeekStartDate(newStartDate);
    console.log('Navigated to previous week:', newStartDate);
    fetchSchedulesForWeek(newStartDate);
  }, [weekStartDate, fetchSchedulesForWeek]);

  const handleNextWeek = useCallback((e) => {
    e.preventDefault();
    const newStartDate = new Date(weekStartDate);
    newStartDate.setDate(weekStartDate.getDate() + 7);
    setWeekStartDate(newStartDate);
    console.log('Navigated to next week:', newStartDate);
    fetchSchedulesForWeek(newStartDate);
  }, [weekStartDate, fetchSchedulesForWeek]);

  const handleRefresh = useCallback(() => {
    initialFetchDone.current = false; // Allow full data fetch
    fetchInitialData();
  }, [fetchInitialData]);

  const formatTime = useCallback((time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 || 12;
    return `${adjustedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }, []);

  const calculateHoursWorked = useCallback((careWorkerName) => {
    const allSchedules = [...schedules, ...pendingSchedules];
    const workerSchedules = allSchedules.filter((s) => {
      if (!s.careWorkers || !Array.isArray(s.careWorkers)) return false;
      return s.careWorkers.some(id => {
        const worker = careWorkers.find(w => w._id === id);
        return worker && worker.name === careWorkerName;
      });
    });
    let totalHours = 0;
    workerSchedules.forEach((schedule) => {
      if (schedule.start && schedule.end) {
        const start = new Date(`1970-01-01T${schedule.start}:00`);
        const end = new Date(`1970-01-01T${schedule.end}:00`);
        const diffMs = end - start;
        const hours = diffMs / (1000 * 60 * 60);
        totalHours += hours > 0 ? hours : 0;
      }
    });
    return totalHours.toFixed(2);
  }, [schedules, pendingSchedules, careWorkers]);

  const handleExport = useCallback(() => {
    const allSchedules = [...schedules, ...pendingSchedules];
    const weekSchedules = allSchedules.filter((schedule) => {
      if (!schedule.date) return false;
      return days.some((day) => day.dateStr === schedule.date);
    }).sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      const locationCompare = a.location.localeCompare(b.location);
      if (locationCompare !== 0) return locationCompare;
      return a.start.localeCompare(b.start);
    });

    if (weekSchedules.length === 0) {
      setError('No schedules available to export for this week.');
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Weekly Schedule - ${weekRangeLabel()}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              font-size: 12px;
            }
            h1 {
              text-align: center;
              font-size: 16px;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              font-size: 10px;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            @media print {
              body {
                margin: 0;
                font-size: 10pt;
              }
              table {
                page-break-inside: auto;
              }
              tr {
                page-break-inside: avoid;
                page-break-after: auto;
              }
              th, td {
                font-size: 8pt;
                padding: 6px;
              }
            }
            @media screen and (max-width: 600px) {
              th, td {
                font-size: 8px;
                padding: 6px;
              }
            }
          </style>
        </head>
        <body>
          <h1>Weekly Schedule: ${weekRangeLabel()}</h1>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Location</th>
                <th>Care Worker</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Break Duration</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${weekSchedules.map((schedule) => `
                <tr>
                  <td>${new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                  <td>${schedule.location || 'Time Off'}</td>
                  <td>${schedule.careWorker || 'None'}</td>
                  <td>${formatTime(schedule.start)}</td>
                  <td>${formatTime(schedule.end)}</td>
                  <td>${schedule.breakDuration || 'None'}</td>
                  <td>${schedule.description || '-'}</td>
                  <td>${schedule.isPublished ? 'Published' : 'Pending'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setError('Failed to open print window. Please allow pop-ups for this site.');
      return;
    }
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, [schedules, pendingSchedules, days, weekRangeLabel, formatTime]);

  const handleAddSchedule = useCallback((dayDate, locationName) => {
    if (!isAdmin) return;
    setModalDayDate(dayDate);
    setModalLocation(locationName);
    setSelectedSchedule(null);
    setIsModalOpen(true);
  }, [isAdmin]);

  const handleEditSchedule = useCallback((schedule) => {
    if (!isAdmin && !schedule.isPublished) return;
    setModalDayDate(schedule.date);
    setModalLocation(schedule.location);
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  }, [isAdmin]);

  const handleSaveSchedule = useCallback(async (newSchedules) => {
    if (!isAdmin) return;
    try {
      if (newSchedules[0].isPublished) {
        for (const newSchedule of newSchedules) {
          const updatedSchedule = {
            start: newSchedule.start,
            end: newSchedule.end,
            description: newSchedule.description,
            careWorker: newSchedule.careWorkers,
            location: newSchedule.location,
            date: newSchedule.date,
            break: newSchedule.break,
          };
          const response = await updateSchedule(newSchedule.originalScheduleId || newSchedule.id.split('-')[0], updatedSchedule);
          setSchedules((prev) => {
            const index = prev.findIndex((s) => s.id === newSchedule.id);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = {
                id: response.data._id + '-' + newSchedule.careWorkers[0],
                start: response.data.start || '',
                end: response.data.end || '',
                description: response.data.description || '',
                careWorkers: [newSchedule.careWorkers[0]],
                careWorker: careWorkers.find(w => w._id === newSchedule.careWorkers[0])?.name || 'Unknown',
                location: response.data.location?.name || newSchedule.location,
                date: response.data.date || '',
                breakDuration: response.data.break ? `${response.data.break} mins` : '',
                isPublished: response.data.isPublished || true,
                originalScheduleId: response.data._id,
              };
              return updated;
            }
            return [...prev, {
              ...newSchedule,
              careWorker: careWorkers.find(w => w._id === newSchedule.careWorkers[0])?.name || 'Unknown',
              originalScheduleId: response.data._id,
            }];
          });
        }
      } else {
        setPendingSchedules((prev) => {
          const newIds = newSchedules.map(s => s.id);
          const filteredPrev = prev.filter(s => !newIds.includes(s.id));
          const updated = [...filteredPrev, ...newSchedules];
          console.log('Updated pendingSchedules:', updated);
          return updated;
        });
        const locationName = newSchedules[0].location;
        const location = locations.find(loc => loc.name === locationName);
        if (location) {
          setOpenLocationDropdowns(prev => new Set([...prev, location._id]));
        }
      }
      setError(null);
    } catch (err) {
      console.error('Error saving schedules:', err);
      const message = err.response?.status === 401
        ? 'Not authorized. Please log in as admin or manager.'
        : err.response?.data?.msg || 'Failed to save schedules';
      setError(message);
    }
  }, [isAdmin, careWorkers, locations]);

  const handleDeleteSchedule = useCallback((scheduleItemToDelete) => {
    if (!isAdmin) return;
    setScheduleToDelete(scheduleItemToDelete);
    setIsConfirmDeleteModalOpen(true);
  }, [isAdmin]);

  const confirmDeleteSchedule = useCallback(async () => {
    if (!scheduleToDelete) return;

    try {
      const idForBackendDeletion = scheduleToDelete.originalScheduleId || scheduleToDelete._id;
      const idForLocalDeletion = scheduleToDelete.id;

      const isPendingLocally = !scheduleToDelete._id && !scheduleToDelete.originalScheduleId &&
                               pendingSchedules.some(s => s.id === idForLocalDeletion);

      if (isPendingLocally) {
        setPendingSchedules(prev => prev.filter(s => s.id !== idForLocalDeletion));
        console.log('Deleted pending schedule locally (UUID):', idForLocalDeletion);
      } else {
        if (!idForBackendDeletion) {
          setError("Error: Cannot delete. Schedule is missing a valid database ID (_id or originalScheduleId).");
          console.error("Persisted schedule is missing _id or originalScheduleId:", scheduleToDelete);
          return;
        }

        console.log('Attempting to delete schedule from backend with ID:', idForBackendDeletion);
        await deleteSchedule(idForBackendDeletion);
        setSchedules(prev => prev.filter(s => 
          s.id !== idForLocalDeletion && 
          s.originalScheduleId !== idForBackendDeletion && 
          s._id !== idForBackendDeletion
        ));
        console.log('Successfully deleted schedule from backend and updated local state.');
      }

      setError(null);
      setIsConfirmDeleteModalOpen(false);
      setScheduleToDelete(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error in confirmDeleteSchedule:', err);
      let message = 'Failed to delete schedule due to an unexpected error.';
      if (err.response) {
        if (err.response.status === 401) {
          message = 'Not authorized. You must be an admin or manager to delete schedules.';
        } else if (err.response.status === 404) {
          message = 'Schedule not found or already deleted on the server.';
        } else if (err.response.status === 400 && err.response.data?.message?.includes('Cast to ObjectId failed')) {
          message = 'Internal error: Invalid ID format sent to server.';
        } else {
          message = err.response.data?.msg || err.response.data?.message || message;
        }
      } else if (err.request) {
        message = 'Network error: Could not reach the server. Please check your internet connection.';
      } else {
        message = err.message || message;
      }
      setError(message);
      setIsConfirmDeleteModalOpen(false);
      setScheduleToDelete(null);
    }
  }, [scheduleToDelete, pendingSchedules, isAdmin]);

  const handlePublishClick = useCallback(() => {
    if (!isAdmin) return;
    if (pendingSchedules.length === 0) {
      setError('No pending schedules to publish.');
      return;
    }
    setIsConfirmPublishModalOpen(true);
  }, [isAdmin, pendingSchedules]);

  const triggerNotificationRefresh = useCallback(() => {
    const event = new CustomEvent(NOTIFICATION_EVENT);
    window.dispatchEvent(event);
  }, []);

  // const handlePublish = useCallback(async () => {
  //   setIsConfirmPublishModalOpen(false);
  //   try {
  //     const schedulesData = pendingSchedules.map(schedule => {
  //       if (!schedule.careWorkers?.length) {
  //         throw new Error('At least one care worker is required.');
  //       }
  //       if (!schedule.location) {
  //         throw new Error('Location is required.');
  //       }
  //       if (!schedule.date || !/^\d{4}-\d{2}-\d{2}$/.test(schedule.date)) {
  //         throw new Error('Invalid date format. Expected YYYY-MM-DD.');
  //       }
  //       if (!schedule.start || !schedule.end || !/^([01]\d|2[0-3]):[0-5]\d$/.test(schedule.start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(schedule.end)) {
  //         throw new Error('Invalid time format. Expected HH:MM.');
  //       }
  //       const breakDuration = schedule.breakDuration && /^\d+ mins$/.test(schedule.breakDuration) ? schedule.breakDuration : '0 mins';
  //       return {
  //         start: schedule.start,
  //         end: schedule.end,
  //         description: schedule.description || '',
  //         careWorkers: schedule.careWorkers,
  //         location: schedule.location,
  //         date: schedule.date,
  //         break: schedule.break,
  //         id: schedule.id.split('-')[0],
  //       };
  //     });
  //     console.log('Publishing schedules:', JSON.stringify(schedulesData, null, 2));
  //     const createResponse = await createSchedulesBatch(schedulesData);
  //     const scheduleIds = createResponse.data.map(schedule => schedule._id);
  //     const publishResponse = await publishSchedules(scheduleIds);
  //     console.log('Publish response:', publishResponse.data);
  //     const newSchedules = [];
  //     publishResponse.data.forEach(schedule => {
  //       const careWorkerIds = Array.isArray(schedule.careWorker)
  //         ? schedule.careWorker.map(cw => cw._id || cw).filter(Boolean)
  //         : [schedule.careWorker?._id || schedule.careWorker].filter(Boolean);
  //       careWorkerIds.forEach(careWorkerId => {
  //         const careWorkerName = careWorkers.find(w => w._id === careWorkerId)?.name || 'Unknown';
  //         newSchedules.push({
  //           id: schedule._id + '-' + careWorkerId,
  //           start: schedule.start || '',
  //           end: schedule.end || '',
  //           description: schedule.description || '',
  //           careWorkers: [careWorkerId],
  //           careWorker: careWorkerName,
  //           location: schedule.location?.name || schedule.location || 'Time Off',
  //           date: schedule.date || '',
  //           breakDuration: schedule.break ? `${schedule.break} mins` : '',
  //           isPublished: true,
  //           originalScheduleId: schedule._id,
  //         });
  //       });
  //     });
  //     console.log('New published schedules:', newSchedules);
  //     setSchedules(prev => [...prev, ...newSchedules]);
  //     setPendingSchedules([]);
  //     setError(null);
  //   } catch (err) {
  //     console.error('Publish error:', err);
  //     const message = err.response?.status === 400
  //       ? err.response?.data?.msg || 'Invalid schedule data'
  //       : err.response?.status === 401
  //         ? 'Not authorized. Please log in as admin or manager.'
  //         : err.message || 'Failed to publish schedules';
  //     setError(message);
  //   }
  // }, [pendingSchedules, careWorkers]);
  const handlePublish = useCallback(async () => {
    setIsConfirmPublishModalOpen(false);
    try {
      const schedulesData = pendingSchedules.map(schedule => {
        if (!schedule.careWorkers?.length) {
          throw new Error('At least one care worker is required.');
        }
        if (!schedule.location) {
          throw new Error('Location is required.');
        }
        if (!schedule.date || !/^\d{4}-\d{2}-\d{2}$/.test(schedule.date)) {
          throw new Error('Invalid date format. Expected YYYY-MM-DD.');
        }
        if (!schedule.start || !schedule.end || !/^([01]\d|2[0-3]):[0-5]\d$/.test(schedule.start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(schedule.end)) {
          throw new Error('Invalid time format. Expected HH:MM.');
        }
        const breakDuration = schedule.breakDuration && /^\d+ mins$/.test(schedule.breakDuration) ? schedule.breakDuration : '0 mins';
        return {
          start: schedule.start,
          end: schedule.end,
          description: schedule.description || '',
          careWorkers: schedule.careWorkers,
          location: schedule.location,
          date: schedule.date,
          break: breakDuration,
          id: schedule.id.split('-')[0],
        };
      });
      console.log('Publishing schedules:', JSON.stringify(schedulesData, null, 2));
      const createResponse = await createSchedulesBatch(schedulesData);
      const scheduleIds = createResponse.data.map(schedule => schedule._id);
      const publishResponse = await publishSchedules(scheduleIds);
      console.log('Publish response:', publishResponse.data);
      const newSchedules = [];
      publishResponse.data.forEach(schedule => {
        const careWorkerIds = Array.isArray(schedule.careWorker)
          ? schedule.careWorker.map(cw => cw._id || cw).filter(Boolean)
          : [schedule.careWorker?._id || schedule.careWorker].filter(Boolean);
        careWorkerIds.forEach(careWorkerId => {
          const careWorkerName = careWorkers.find(w => w._id === careWorkerId)?.name || 'Unknown';
          newSchedules.push({
            id: schedule._id + '-' + careWorkerId,
            start: schedule.start || '',
            end: schedule.end || '',
            description: schedule.description || '',
            careWorkers: [careWorkerId],
            careWorker: careWorkerName,
            location: schedule.location?.name || schedule.location || 'Time Off',
            date: schedule.date || '',
            breakDuration: schedule.break ? `${schedule.break} mins` : '',
            isPublished: true,
            originalScheduleId: schedule._id,
          });
        });
      });
      console.log('New published schedules:', newSchedules);
      setSchedules(prev => [...prev, ...newSchedules]);
      setPendingSchedules([]);
      setError(null);

      // Trigger notification refresh
      triggerNotificationRefresh();
    } catch (err) {
      console.error('Publish error:', err);
      const message = err.response?.status === 400
        ? err.response?.data?.msg || 'Invalid schedule data'
        : err.response?.status === 401
          ? 'Not authorized. Please log in as admin or manager.'
          : err.message || 'Failed to publish schedules';
      setError(message);
    }
  }, [pendingSchedules, careWorkers, triggerNotificationRefresh]);

  const handleLocationCheckboxChange = useCallback((locationId) => {
    if (!isAdmin) return;
    setSelectedLocations((prevSelected) => {
      const isSelected = prevSelected.includes(locationId);
      let newSelected;
      if (isSelected) {
        newSelected = prevSelected.filter((id) => id !== locationId);
      } else {
        newSelected = [...prevSelected, locationId];
      }
      const finalSelected = newSelected.length > 0 ? newSelected : ['time-off'];
      console.log('Updated selectedLocations:', finalSelected);
      return finalSelected;
    });
  }, [isAdmin]);

  const handleSelectAllLocations = useCallback(() => {
    if (!isAdmin) return;
    const allLocationIds = allAvailableAreas.map((loc) => loc._id);
    setSelectedLocations((prevSelected) => {
      const newSelected = prevSelected.length === allLocationIds.length ? ['time-off'] : allLocationIds;
      console.log('Select all locations:', newSelected);
      return newSelected;
    });
  }, [isAdmin, allAvailableAreas]);

  const getSortedDaySchedules = useMemo(() => (dateStr, locationName, locationId) => {
    const allSchedules = [...schedules, ...pendingSchedules];
    const filter = scheduleFilters[locationId] || { status: 'all', careWorker: 'all' };
    
    const filteredSchedules = allSchedules
      .filter((s) => {
        if (s.date !== dateStr || s.location !== locationName) return false;
        if (filter.status === 'published' && !s.isPublished) return false;
        if (filter.status === 'unpublished' && s.isPublished) return false;
        if (filter.careWorker !== 'all' && !s.careWorkers.includes(filter.careWorker)) return false;
        return true;
      })
      .sort((a, b) => a.start.localeCompare(b.start));
    
    console.log(`Schedules for ${locationName} on ${dateStr}:`, filteredSchedules);
    return filteredSchedules;
  }, [schedules, pendingSchedules, scheduleFilters]);

  const toggleLocationDropdown = useCallback((locationId) => {
    if (!isAdmin && !selectedLocations.includes(locationId)) return;
    setOpenLocationDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(locationId)) {
        newSet.delete(locationId);
        setScheduleFilters(prevFilters => {
          const newFilters = { ...prevFilters };
          delete newFilters[locationId];
          return newFilters;
        });
      } else {
        newSet.add(locationId);
        setScheduleFilters(prevFilters => ({
          ...prevFilters,
          [locationId]: { status: 'all', careWorker: 'all' }
        }));
      }
      console.log('Toggled dropdown for location:', locationId, 'New openLocationDropdowns:', [...newSet]);
      return newSet;
    });
  }, [isAdmin, selectedLocations]);

  const dynamicCareWorkers = useMemo(() => {
    const uniqueWorkers = new Set();
    careWorkers.forEach((worker) => uniqueWorkers.add(worker.name));
    [...schedules, ...pendingSchedules].forEach((s) => {
      if (s.careWorker && s.careWorker.trim()) {
        uniqueWorkers.add(s.careWorker);
      }
    });
    const workerList = Array.from(uniqueWorkers).sort();
    console.log('Dynamic care workers:', workerList);
    return workerList;
  }, [schedules, pendingSchedules, careWorkers]);

  const headerLocationButtonText = useMemo(() => {
    if (!allAvailableAreas || allAvailableAreas.length === 0) {
      console.log('No available areas, defaulting to Time Off');
      return 'Time Off';
    }
    if (selectedLocations.length === 0) {
      console.log('No locations selected, defaulting to Time Off');
      return 'Time Off';
    }
    if (selectedLocations.length === 1) {
      const selectedLoc = allAvailableAreas.find((loc) => loc._id === selectedLocations[0]);
      if (!selectedLoc) {
        console.log(`Selected location ID ${selectedLocations[0]} not found in allAvailableAreas`, allAvailableAreas);
        return 'Time Off';
      }
      return selectedLoc.name;
    }
    if (selectedLocations.length === allAvailableAreas.length) {
      return 'All Locations';
    }
    return `${selectedLocations.length} Locations Selected`;
  }, [selectedLocations, allAvailableAreas]);

  const ScheduleCard = ({ schedule, onEdit, isAdmin }) => {
    const isCompleted = () => {
      const scheduleDateTime = new Date(`${schedule.date}T${schedule.end}:00`);
      const now = new Date();
      return scheduleDateTime < now;
    };


    return (
      <div
        className={`text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs mb-1 transition-colors duration-200 shadow-sm min-h-[44px] ${
          isCompleted()
            ? 'bg-gray-500 hover:bg-gray-600'
            : schedule.isPublished
            ? 'bg-blue-500 hover:bg-blue-600'
            : 'bg-gray-400 hover:bg-gray-500'
        } ${isAdmin || schedule.isPublished ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={() => (isAdmin || schedule.isPublished) && onEdit(schedule)}
      >
        <div className="truncate">
          {formatTime(schedule.start)} - {formatTime(schedule.end)}
        </div>
        {schedule.careWorker && <div className="mt-1 truncate">{schedule.careWorker}</div>}
      </div>
    );
  };

  const publishButtonText = pendingSchedules.length === 0 ? 'Published' : 'Publish';

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-100 font-sans">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-700 text-base sm:text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between w-full sm:w-auto mb-2 sm:mb-0">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              className="sm:hidden p-2 text-gray-600 hover:text-gray-800"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>
            <div className="relative">
              <button
                onClick={() => isAdmin && setIsHeaderLocationDropdownOpen(!isHeaderLocationDropdownOpen)}
                className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 text-xs sm:text-sm font-medium transition-colors duration-200 min-h-[44px]"
              >
                <span className="mr-1">
                  <img src="/location.svg" alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>
                <span className="truncate">{headerLocationButtonText}</span>
                {isAdmin && (
                  <svg
                    className="ml-1 w-3 sm:w-4 h-3 sm:h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                )}
              </button>
              {isHeaderLocationDropdownOpen && isAdmin && (
                <div className="absolute left-0 mt-2 w-48 sm:w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 max-h-60 sm:max-h-80 overflow-y-auto">
                  <div className="py-1">
                    <label className="flex items-center px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-3 sm:h-4 w-3 sm:w-4 text-blue-600"
                        checked={selectedLocations.length === allAvailableAreas.length}
                        onChange={handleSelectAllLocations}
                      />
                      <span className="ml-2 font-medium">
                        {selectedLocations.length === allAvailableAreas.length ? 'Deselect All' : 'Select All'}
                      </span>
                    </label>
                    <div className="border-t border-gray-200 my-1"></div>
                    {allAvailableAreas.map((loc) => (
                      <label
                        key={`loc-${loc._id}`}
                        className="flex items-center px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="form-checkbox h-3 sm:h-4 w-3 sm:w-4 text-blue-600"
                          value={loc._id}
                          checked={selectedLocations.includes(loc._id)}
                          onChange={() => handleLocationCheckboxChange(loc._id)}
                        />
                        <span className="ml-2 truncate">{loc.workType ? `${loc.workType} - ` : ''}{loc.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center bg-blue-600 rounded-md text-white text-xs sm:text-sm font-medium sm:p-[4px] sm:min-h-[40px]">
              <button
                onClick={handlePreviousWeek}
                className="px-1 sm:px-2 py-0 sm:py-1 hover:bg-gray-200 rounded-l-md transition-colors duration-200 bg-white text-black rounded-md min-h-[30px] sm:min-h-[35px]"
              >
                く
              </button>
              <span className="px-2 py-1 sm:py-1.5 truncate">{weekRangeLabel()}</span>
              <button
                onClick={handleNextWeek}
                className="px-1 sm:px-2 py-0 sm:py-1 hover:bg-gray-200 rounded-l-md transition-colors duration-200 bg-white text-black rounded-md min-h-[30px] sm:min-h-[35px] rotate-180"
              >
                く
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          <div className="flex items-center space-x-2 sm:space-x-4 text-gray-600 text-xs sm:text-sm flex-wrap gap-y-2">
            <button type="button" onClick={handleRefresh} className="hover:text-blue-600 transition-colors duration-200" title="Refresh">
              <img src="/refresh.svg" alt="" className="w-4 sm:w-[16px]" />
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center font-medium hover:text-blue-600 transition-colors duration-200 gap-[2px]"
            >
              <img src="/outbox.svg" alt="" className="w-4 sm:w-[20px]" /> Export
            </button>
            <button
              type="button"
              onClick={handlePublishClick}
              className="flex items-center bg-green-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-green-700 transition duration-200 font-medium min-h-[36px] sm:min-h-[44px]"
            >
              {publishButtonText}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`fixed sm:static inset-y-0 left-0 w-48 sm:w-64 bg-white p-2 sm:p-4 border-r border-gray-200 overflow-y-auto flex-shrink-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'} z-10`}>
          <div className="relative mb-3 sm:mb-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1 sm:py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-xs sm:text-sm"
            />
            <svg
              className="absolute left-2 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Care Workers</h2>
          <div className="space-y-2 sm:space-y-3">
            {dynamicCareWorkers.map((worker) => (
              <div
                key={worker}
                className="flex items-center p-2 bg-gray-50 rounded-md border border-gray-200 shadow-sm"
              >
                <span className="text-gray-700 text-xs sm:text-sm font-medium truncate">{worker}</span>
                <span className="ml-auto text-xs text-gray-500">{calculateHoursWorked(worker)} hrs</span>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 p-2 sm:p-4 bg-gray-100 overflow-y-auto">
          {error && (
            <div className="mb-3 sm:mb-4 text-red-500 text-xs sm:text-sm text-center">{error}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 sm:gap-4 mb-3 sm:mb-4">
            {days.map((day) => (
              <div
                key={day.dateStr}
                className={`flex flex-col items-center justify-center py-2 px-2 sm:px-4 rounded-lg ${
                  day.dateStr === new Date().toISOString().split('T')[0]
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700'
                } ${day.dateStr < new Date().toISOString().split('T')[0] ? 'opacity-50 cursor-not-allowed' : ''} shadow-sm min-h-[60px] sm:min-h-[80px]`}
              >
                <span className="text-xs font-semibold">{day.shortDay}</span>
                <span className="text-base sm:text-lg font-bold">{day.dayNum}</span>
              </div>
            ))}
          </div>

          {currentVisibleLocations.length > 0 ? (
            <>
              {currentVisibleLocations.map((area) => (
                <div key={area._id} className="bg-white rounded-lg shadow-sm mb-3 sm:mb-4">
                  <button
                    onClick={() => toggleLocationDropdown(area._id)}
                    className="flex justify-between items-center w-full px-3 sm:px-4 py-2 sm:py-3 font-semibold border-b-2 text-gray-700 rounded-t-lg bg-white hover:border-blue-500 hover:border-b-4 hover:border-opacity-75 transition-colors duration-200 text-xs sm:text-sm min-h-[44px]"
                  >
                    <span className="flex items-center truncate">
                      <div className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full mr-2 ${area._id === 'time-off' ? 'bg-gray-500' : 'bg-blue-500'}`}></div>
                      {area.workType ? `${area.workType} - ` : ''}{area.name}
                    </span>
                    <svg
                      className={`h-4 sm:h-5 w-4 sm:w-5 text-gray-500 transform transition-transform ${openLocationDropdowns.has(area._id) ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  {openLocationDropdowns.has(area._id) && (
                    <div key={`dropdown-${area._id}`} className="mt-2 p-3 sm:p-4 bg-gray-50 rounded-b-lg shadow-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 sm:gap-4">
                        {days.map((day) => (
                          <div
                            key={day.dateStr}
                            className="bg-white rounded-lg shadow-sm p-2 sm:p-3 flex flex-col justify-between min-h-[100px] sm:min-h-[120px] border border-gray-200 w-full sm:w-[170px]"
                          >
                            <div className="flex-grow">
                              {getSortedDaySchedules(day.dateStr, area.name, area._id).map((schedule) => (
                                <ScheduleCard
                                  key={`schedule-${schedule.id}`}
                                  schedule={schedule}
                                  onEdit={day.dateStr < new Date().toISOString().split('T')[0] ? () => {} : handleEditSchedule}
                                  isAdmin={isAdmin}
                                />
                              ))}
                            </div>
                            { isAdmin && (
                              <button
                                onClick={() => handleAddSchedule(day.dateStr, area.name)}
                                className="mt-2 w-full h-7 sm:h-8 rounded-md border border-dashed border-gray-300 text-gray-400 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center text-xs sm:text-sm min-h-[44px]"
                              >
                                + Add
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isAdmin && (
                <div className="flex justify-center mt-4 sm:mt-6">
                  <button
                    onClick={() => setIsNewAreaModalOpen(true)}
                    className="bg-gray-600 text-white rounded-md py-2 sm:py-3 px-4 sm:px-6 font-medium hover:bg-green-700 transition-colors duration-200 text-xs sm:text-sm min-h-[44px]"
                  >
                    + Add New Area
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 sm:py-10 text-gray-500 text-xs sm:text-sm">
              No locations available
            </div>
          )}
        </main>
      </div>

      <AssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assignment={selectedSchedule}
        dayDate={modalDayDate}
        availableLocations={allAvailableAreas}
        defaultLocation={modalLocation}
        availableCareWorkers={careWorkers}
        onSave={handleSaveSchedule}
        onDelete={handleDeleteSchedule}
        schedules={schedules}
        pendingSchedules={pendingSchedules}
        isAdmin={isAdmin}
      />

      <NewAreaModal
        isOpen={isNewAreaModalOpen}
        onClose={() => setIsNewAreaModalOpen(false)}
        availableCareWorkers={careWorkers}
        setLocations={setLocations}
      />

      <ConfirmDeleteModal
        isOpen={isConfirmDeleteModalOpen}
        onClose={() => {
          setIsConfirmDeleteModalOpen(false);
          setScheduleToDelete(null);
        }}
        onConfirm={confirmDeleteSchedule}
      />

      <ConfirmPublishModal
        isOpen={isConfirmPublishModalOpen}
        onClose={() => setIsConfirmPublishModalOpen(false)}
        onConfirm={handlePublish}
      />
    </div>
  );
};

export default SchedulePage;