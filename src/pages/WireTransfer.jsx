import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { transferApi } from '../services/api';
import { ArrowLeft, Send, CheckCircle, Lock } from 'react-feather';
import toast from 'react-hot-toast';

const WireTransfer = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);

  const handleRecipientSubmit = () => {
    if (!bankName || !accountNumber || !ifscCode || !recipientName) {
      toast.error('Please fill in all recipient details');
      return;
    }
    setCurrentStep(2);
  };

  const handleAmountSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter valid amount');
      return;
    }
    if (parseFloat(amount) > (user?.balance || 0)) {
      toast.error('Insufficient balance');
      return;
    }
    setCurrentStep(3);
  };

  const handlePinSubmit = async () => {
    if (!pin || pin.length !== 4) {
      toast.error('Enter 4-digit PIN');
      return;
    }

    setIsLoading(true);
    try {
      const response = await transferApi.wireTransfer({
        recipient_info: {
          name: recipientName,
          bank: bankName,
          account: accountNumber,
          ifsc: ifscCode
        },
        amount: parseFloat(amount),
        transfer_pin: pin,
        message: description || `Wire transfer to ${recipientName}`
      });

      if (response.success) {
        setTransferSuccess(true);
        toast.success(response.message || 'Wire transfer completed!');
        
        // Update user balance in context to reflect change immediately
        if (response.new_balance !== undefined && updateUser) {
          updateUser({ balance: response.new_balance });
        }
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2500);
      } else {
        toast.error(response.error || 'Transfer failed');
      }
    } catch (error) {
      console.error('Wire transfer error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Wire transfer failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (transferSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm w-full">
          <div className="flex justify-center mb-6">
            <CheckCircle size={64} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Wire Transfer Completed!</h2>
          <p className="text-gray-600 mb-1">${parseFloat(amount).toLocaleString()} sent to</p>
          <p className="text-lg font-medium text-gray-900 mb-2">{recipientName}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-600 mb-1">Transaction Fee: $15.00</p>
            {user?.balance && (
              <p className="text-sm text-blue-700">
                New Balance: <span className="font-semibold">${user.balance.toLocaleString()}</span>
              </p>
            )}
          </div>
          <p className="text-sm text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => {
              if (currentStep === 1) {
                navigate('/dashboard');
              } else {
                setCurrentStep(currentStep - 1);
                setAmount('');
                setPin('');
              }
            }}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Wire Transfer</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {currentStep === 1 && 'Step 1 of 3'}
              {currentStep === 2 && 'Step 2 of 3'}
              {currentStep === 3 && 'Step 3 of 3'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="flex gap-1 mb-8">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex-1 h-1 rounded-full transition-colors ${
                step <= currentStep ? 'bg-gray-900' : 'bg-gray-200'
              }`}
            ></div>
          ))}
        </div>
        {/* Account Card */}
        <div className="border border-gray-200 rounded-lg p-4 mb-8">
          <p className="text-xs text-gray-500 mb-1">Sending from</p>
          <p className="text-lg font-semibold text-gray-900">{user?.first_name} {user?.last_name}</p>
          <p className="text-sm text-gray-500">Available: ${(user?.balance || 0).toLocaleString()}</p>
        </div>

        {/* Step 1: Recipient Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Recipient Name *
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Full name"
                className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Bank Name *
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g., HDFC Bank, ICICI Bank"
                className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Account Number *
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                IFSC Code *
              </label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="e.g., HDFC0001234"
                className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleRecipientSubmit}
              disabled={isLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </button>
          </div>
        )}

        {/* Step 2: Amount & Confirm */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Recipient Info */}
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Sending to</p>
              <p className="text-lg font-semibold text-gray-900">{recipientName}</p>
              <p className="text-sm text-gray-500">{bankName} - {accountNumber}</p>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg font-semibold"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-2">Available: ${(user?.balance || 0).toLocaleString()}</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a note..."
                rows="3"
                className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Fee Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Transfer fee</span>
                <span className="text-sm font-medium text-gray-900">$25 (varies by amount)</span>
              </div>
            </div>

            <button
              onClick={handleAmountSubmit}
              disabled={isLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </button>
          </div>
        )}

        {/* Step 3: PIN */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">To</span>
                <span className="text-sm font-medium text-gray-900">{recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="text-sm font-semibold text-gray-900">${parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-sm text-gray-600">Fee</span>
                <span className="text-sm font-medium text-gray-900">$25</span>
              </div>
            </div>

            {/* PIN Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Enter 4-digit PIN
              </label>
              <div className="text-center">
                <div className="flex justify-center gap-2 mb-4">
                  {Array.from({length: 4}, (_, i) => (
                    <div key={i} className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center text-2xl font-semibold text-gray-900">
                      {pin[i] ? '•' : ''}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                  {[1,2,3,4,5,6,7,8,9].map(num => (
                    <button
                      key={num}
                      onClick={() => setPin(prev => prev.length < 4 ? prev + num : prev)}
                      className="h-12 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors"
                      disabled={isLoading}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={() => setPin(prev => prev.length < 4 ? prev + '0' : prev)}
                    className="h-12 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg col-span-2 transition-colors"
                    disabled={isLoading}
                  >
                    0
                  </button>
                  <button
                    onClick={() => setPin('')}
                    className="h-12 bg-red-100 hover:bg-red-200 text-red-600 font-semibold rounded-lg transition-colors"
                    disabled={isLoading}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handlePinSubmit}
              disabled={isLoading || pin.length < 4}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Confirming...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Confirm Transfer
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WireTransfer;
