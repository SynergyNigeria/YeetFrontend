import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { authApi, userApi, transferApi } from '../services/api';
import { ArrowLeft, Lock, Key, LogOut, AlertTriangle } from 'react-feather';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState(null);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  // Fetch user's transactions on component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setTransactionsLoading(true);
        const transactionHistory = await transferApi.getTransactionHistory();
        setTransactions(transactionHistory || []);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        toast.error('Failed to load transactions');
        // Fallback to empty array
        setTransactions([]);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handlePinChange = async () => {
    if (!newPin || !confirmPin) {
      toast.error('Please fill in all fields');
      return;
    }

    // Only require current PIN if user has already set one
    if (user?.has_set_transfer_pin && !currentPin) {
      toast.error('Current PIN is required');
      return;
    }

    if (newPin.length !== 4 || confirmPin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      toast.error('New PINs do not match');
      return;
    }

    setIsLoading(true);
    try {
      await userApi.changePin(currentPin, newPin);
      toast.success('PIN changed successfully!');
      setActiveSection(null);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (error) {
      console.error('PIN change error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to change PIN';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await userApi.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully!');
      setActiveSection(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleReportSubmit = async () => {
    if (!selectedTransaction || !reportReason || !reportDescription.trim()) {
      toast.error('Please select a transaction, choose a reason, and provide a description');
      return;
    }

    setIsLoading(true);
    try {
      await transferApi.reportTransaction(selectedTransaction, reportReason, reportDescription);
      toast.success('Transaction report submitted successfully!');
      setActiveSection(null);
      setSelectedTransaction('');
      setReportReason('');
      setReportDescription('');
    } catch (error) {
      console.error('Report submission error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to submit report';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account Info */}
        <div className="border border-gray-200 rounded-lg p-4 mb-8">
          <p className="text-xs text-gray-500 mb-1">Account</p>
          <p className="text-lg font-semibold text-gray-900">{user?.first_name} {user?.last_name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>

        {/* Settings Options */}
        <div className="space-y-4">
          {/* Change PIN */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setActiveSection(activeSection === 'pin' ? null : 'pin')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock size={20} className="text-gray-600" />
                <span className="text-gray-900 font-medium">Change PIN</span>
              </div>
              <ArrowLeft
                size={16}
                className={`text-gray-400 transition-transform ${activeSection === 'pin' ? 'rotate-90' : '-rotate-90'}`}
              />
            </button>

            {activeSection === 'pin' && (
              <div className="border-t border-gray-200 p-4 space-y-4">
                {user?.has_set_transfer_pin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Current PIN
                    </label>
                    <input
                      type="password"
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="Enter current PIN"
                      className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      maxLength="4"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {user?.has_set_transfer_pin ? 'New PIN' : 'PIN'}
                  </label>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder={user?.has_set_transfer_pin ? "Enter new PIN" : "Enter PIN"}
                    className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    maxLength="4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {user?.has_set_transfer_pin ? 'Confirm New PIN' : 'Confirm PIN'}
                  </label>
                  <input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder={user?.has_set_transfer_pin ? "Confirm new PIN" : "Confirm PIN"}
                    className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    maxLength="4"
                  />
                </div>

                <button
                  onClick={handlePinChange}
                  disabled={isLoading}
                  className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  {isLoading ? 'Updating...' : (user?.has_set_transfer_pin ? 'Update PIN' : 'Set PIN')}
                </button>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setActiveSection(activeSection === 'password' ? null : 'password')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Key size={20} className="text-gray-600" />
                <span className="text-gray-900 font-medium">Change Password</span>
              </div>
              <ArrowLeft
                size={16}
                className={`text-gray-400 transition-transform ${activeSection === 'password' ? 'rotate-90' : '-rotate-90'}`}
              />
            </button>

            {activeSection === 'password' && (
              <div className="border-t border-gray-200 p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handlePasswordChange}
                  disabled={isLoading}
                  className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            )}
          </div>

          {/* Report Transaction */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setActiveSection(activeSection === 'report' ? null : 'report')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-gray-600" />
                <span className="text-gray-900 font-medium">Report Transaction</span>
              </div>
              <ArrowLeft
                size={16}
                className={`text-gray-400 transition-transform ${activeSection === 'report' ? 'rotate-90' : '-rotate-90'}`}
              />
            </button>

            {activeSection === 'report' && (
              <div className="border-t border-gray-200 p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Select Transaction
                  </label>
                  {transactionsLoading ? (
                    <div className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-500">
                      Loading transactions...
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-500">
                      No transactions found
                    </div>
                  ) : (
                    <select
                      value={selectedTransaction}
                      onChange={(e) => setSelectedTransaction(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg text-gray-900 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    >
                      <option value="">Choose a transaction...</option>
                      {transactions.map((transaction) => (
                        <option key={transaction.id} value={transaction.id}>
                          {transaction.transaction_type} - ${transaction.amount} - {transaction.transaction_id} ({new Date(transaction.created_at).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Reason for Report
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg text-gray-900 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="">Choose a reason...</option>
                    <option value="UNAUTHORIZED">Unauthorized transaction</option>
                    <option value="INCORRECT_AMOUNT">Incorrect amount</option>
                    <option value="DUPLICATE">Duplicate transaction</option>
                    <option value="NOT_RECEIVED">Payment not received</option>
                    <option value="OTHER">Other issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Description
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Please provide additional details about the issue..."
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  onClick={handleReportSubmit}
                  disabled={isLoading || transactionsLoading}
                  className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  {isLoading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            )}
          </div>

          {/* Logout */}
          <div className="border border-red-200 rounded-lg">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut size={20} className="text-red-600" />
                <span className="text-red-600 font-medium">Logout</span>
              </div>
              <ArrowLeft size={16} className="text-red-400 -rotate-90" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;