import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { transferApi } from '../services/api';
import { ArrowLeft, Search, CheckCircle, Lock } from 'react-feather';
import toast from 'react-hot-toast';

const YeetTransfer = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [accountNumber, setAccountNumber] = useState('');
  const [receiverDetails, setReceiverDetails] = useState(null);
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Search for receiver account using real API
  const searchAccount = async () => {
    if (!accountNumber.trim()) {
      toast.error('Please enter account number');
      return;
    }

    if (accountNumber.length !== 10) {
      toast.error('Account number must be 10 digits');
      return;
    }

    if (accountNumber === user?.account_number) {
      toast.error('Cannot transfer to your own account');
      return;
    }

    setIsLoading(true);
    try {
      const response = await transferApi.validateReceiver(accountNumber);
      if (response.valid && response.receiver) {
        setReceiverDetails({
          name: `${response.receiver.first_name} ${response.receiver.last_name}`,
          email: response.receiver.email || 'N/A',
          account_number: response.receiver.account_number
        });
        setCurrentStep(2);
        toast.success('Account found!');
      } else {
        toast.error(response.error || 'Account not found');
      }
    } catch (error) {
      console.error('Account validation error:', error);
      toast.error(error.response?.data?.error || 'Failed to validate account');
    } finally {
      setIsLoading(false);
    }
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
      const response = await transferApi.yeetTransfer(
        accountNumber, 
        amount, 
        pin, 
        `Transfer to ${receiverDetails?.name}`
      );

      if (response.success) {
        setTransferSuccess(true);
        toast.success(response.message || 'Transfer successful!');
        
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
      console.error('Transfer error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Transfer failed. Please try again.';
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Transfer Successful</h2>
          <p className="text-gray-600 mb-1">${parseFloat(amount).toLocaleString()}</p>
          <p className="text-lg font-medium text-gray-900 mb-4">{receiverDetails?.name}</p>
          {user?.balance && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-700">
                New Balance: <span className="font-semibold">${user.balance.toLocaleString()}</span>
              </p>
            </div>
          )}
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
            <h1 className="text-lg font-semibold text-gray-900">Transfer Money</h1>
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

        {/* Step 1: Account Lookup */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Receiver's Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyPress={(e) => e.key === 'Enter' && searchAccount()}
                placeholder="Enter 10-digit account number"
                className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg tracking-wide"
                disabled={isLoading}
                maxLength="10"
              />
              <p className="text-xs text-gray-500 mt-2">{accountNumber.length}/10 digits</p>
            </div>

            <button
              onClick={searchAccount}
              disabled={isLoading || accountNumber.length !== 10}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Continue
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Confirm & Amount */}
        {currentStep === 2 && receiverDetails && (
          <div className="space-y-6">
            {/* Receiver Info */}
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Sending to</p>
              <p className="text-lg font-semibold text-gray-900">{receiverDetails.name}</p>
              <p className="text-sm text-gray-500">Account: {accountNumber}</p>
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
                onKeyPress={(e) => e.key === 'Enter' && handleAmountSubmit()}
                placeholder="Enter amount"
                className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg font-semibold"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-2">Available: ${(user?.balance || 0).toLocaleString()}</p>
            </div>

            {/* Fee Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Transfer fee</span>
                <span className="text-sm font-medium text-gray-900">Free</span>
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
                <span className="text-sm font-medium text-gray-900">{receiverDetails?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="text-sm font-semibold text-gray-900">${parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-sm text-gray-600">Fee</span>
                <span className="text-sm font-medium text-gray-900">$0</span>
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

export default YeetTransfer;