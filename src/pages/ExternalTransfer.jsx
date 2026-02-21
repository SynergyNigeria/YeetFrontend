import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { transferApi } from '../services/api';
import { ArrowLeft, Send, CheckCircle, Lock } from 'react-feather';
import toast from 'react-hot-toast';

const ExternalTransfer = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);

  const handleRecipientSubmit = () => {
    if (!bankName.trim() || !accountNumber.trim() || !recipientName.trim()) {
      toast.error(t('Please fill in all required recipient details'));
      return;
    }
    
    if (accountNumber.length < 8) {
      toast.error(t('Account number too short'));
      return;
    }
    
    setCurrentStep(2);
  };

  const handleAmountSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error(t('Enter valid amount'));
      return;
    }
    
    const amountValue = parseFloat(amount);
    const fee = 1.00; // $1 external transfer fee
    const totalRequired = amountValue + fee;
    
    if (totalRequired > (user?.balance || 0)) {
      toast.error(`${t('Insufficient balance. Required:')} $${totalRequired.toLocaleString()} (${t('including')} $${fee} ${t('fee')})`);
      return;
    }
    
    setCurrentStep(3);
  };

  const handlePinSubmit = async () => {
    if (!pin || pin.length !== 4) {
      toast.error(t('Enter 4-digit PIN'));
      return;
    }

    setIsLoading(true);
    try {
      // Use YEET transfer API for external transfers with external account format
      const response = await transferApi.yeetTransfer(
        accountNumber, // External account number
        parseFloat(amount),
        pin,
        message || `${t('External transfer to')} ${recipientName} ${t('at')} ${bankName}`
      );

      if (response.success) {
        setTransferSuccess(true);
        toast.success(response.message || t('External transfer completed!'));
        
        // Update user balance in context to reflect change immediately
        if (response.new_balance !== undefined && updateUser) {
          updateUser({ balance: response.new_balance });
        }
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2500);
      } else {
        toast.error(response.error || t('Transfer failed'));
      }
    } catch (error) {
      console.error('External transfer error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          t('External transfer failed. Please try again.');
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t('External Transfer Completed!')}</h2>
          <p className="text-gray-600 mb-1">${parseFloat(amount).toLocaleString()} {t('sent to')}</p>
          <p className="text-lg font-medium text-gray-900 mb-2">{recipientName}</p>
          <p className="text-sm text-gray-600 mb-3">{bankName} • ****{accountNumber.slice(-4)}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-600 mb-1">{t('Processing Fee:')} $1.00</p>
            {user?.balance && (
              <p className="text-sm text-blue-700">
                {t('New Balance:')} <span className="font-semibold">${user.balance.toLocaleString()}</span>
              </p>
            )}
          </div>
          <p className="text-sm text-gray-500">{t('Redirecting...')}</p>
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
            <h1 className="text-lg font-semibold text-gray-900">{t('External Transfer')}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('Send to external bank accounts')}
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
          <p className="text-xs text-gray-500 mb-1">{t('Sending from')}</p>
          <p className="text-lg font-semibold text-gray-900">{user?.first_name} {user?.last_name}</p>
          <p className="text-sm text-gray-500">{t('Available:')} ${(user?.balance || 0).toLocaleString()}</p>
        </div>

        {/* Step 1: Recipient Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('Recipient Name')} *
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder={t('Full name of recipient')}
                className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('Bank Name')} *
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder={t('e.g., Chase Bank, Wells Fargo, Bank of America')}
                className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('Account Number')} *
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 17))}
                placeholder={t('Enter recipient\'s account number')}
                className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('Usually 8-17 digits long')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('Routing Number (Optional)')}
              </label>
              <input
                type="text"
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                placeholder={t('9-digit routing number')}
                className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleRecipientSubmit}
              disabled={isLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {t('Continue')}
            </button>
          </div>
        )}

        {/* Step 2: Amount */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-gray-900 mb-1">{t('Sending to:')}</p>
              <p className="text-lg font-semibold text-gray-900">{recipientName}</p>
              <p className="text-sm text-gray-600">{bankName} • ****{accountNumber.slice(-4)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('Amount')} *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-900 text-lg font-semibold">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-4 pl-8 pr-4 text-2xl font-semibold focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  disabled={isLoading}
                  step="0.01"
                  min="0.01"
                />
              </div>
              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">{t('External Transfer Fee:')}</span> $1.00
                </p>
                {amount && (
                  <p className="text-sm text-yellow-800 mt-1">
                    <span className="font-semibold">{t('Total Deducted:')}</span> ${(parseFloat(amount) + 1).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('Message (Optional)')}
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('Purpose of transfer')}
                className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-3 px-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleAmountSubmit}
              disabled={isLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {t('Continue')}
            </button>
          </div>
        )}

        {/* Step 3: PIN Confirmation */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Transaction Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Transfer Summary')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('Recipient')}</span>
                  <span className="font-semibold text-gray-900">{recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('Bank')}</span>
                  <span className="font-semibold text-gray-900">{bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('Account')}</span>
                  <span className="font-semibold text-gray-900">****{accountNumber.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('Amount')}</span>
                  <span className="font-semibold text-gray-900">${parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('Processing Fee')}</span>
                  <span className="font-semibold text-gray-900">$1.00</span>
                </div>
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">{t('Total')}</span>
                    <span className="font-bold text-gray-900">${(parseFloat(amount) + 1).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PIN Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('Enter Transfer PIN')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder={t('4-digit PIN')}
                  className="w-full border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none py-4 pl-12 pr-4 text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  disabled={isLoading}
                  maxLength="4"
                />
              </div>
            </div>

            <button
              onClick={handlePinSubmit}
              disabled={isLoading || pin.length !== 4}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Send size={18} />
              )}
              {isLoading ? t('Processing...') : t('Send External Transfer')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExternalTransfer;