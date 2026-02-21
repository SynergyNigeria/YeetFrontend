import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { transferApi, notificationApi } from '../services/api';
import { Send, DollarSign, MessageCircle, Settings, Eye, EyeOff, Copy, Check, TrendingUp, TrendingDown, Bell, Plus, Clock } from 'react-feather';
import LanguageSelector from '../components/Common/LanguageSelector';
import InstallPromptBanner from '../components/Common/InstallPromptBanner';

const Dashboard = () => {
  const { user, fetchCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showBalance, setShowBalance] = useState(true);
  const [copiedField, setCopiedField] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTransferPopup, setShowTransferPopup] = useState(false);
  const [showAddMoneyPopup, setShowAddMoneyPopup] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [addMoneyLoading, setAddMoneyLoading] = useState(false);
  const [addMoneyError, setAddMoneyError] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Fetch real data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Add a small delay to ensure signals have completed for new users
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const [notificationsData, transactionsData, unreadCount] = await Promise.all([
          notificationApi.getNotifications().catch((error) => {
            console.error('Failed to fetch notifications:', error);
            return [];
          }),
          transferApi.getTransactionHistory().catch((error) => {
            console.error('Failed to fetch transaction history:', error);
            return [];
          }),
          notificationApi.getUnreadCount().catch((error) => {
            console.error('Failed to fetch unread count:', error);
            return 0;
          })
        ]);
        
        console.log('Dashboard data fetched:', { 
          notifications: notificationsData, 
          transactions: transactionsData, 
          unreadCount 
        });
        
        // Process transactions to add correct type and user info based on current user perspective
        const processedTransactions = Array.isArray(transactionsData) ? transactionsData.map(txn => {
          const isSender = txn.sender === user?.id;
          
          return {
            ...txn,
            type: isSender ? 'sent' : 'received',
            user: isSender ? (txn.recipient_name || 'External Account') : (txn.sender_name || 'External Account'),
            message: txn.description || 'Transfer',
            status: txn.status ? txn.status.toLowerCase() : 'completed'
          };
        }) : [];
        
        setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
        setRecentTransactions(processedTransactions);
        setUnreadNotificationCount(typeof unreadCount === 'number' ? unreadCount : 0);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Keep empty arrays as fallback
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Periodic refresh for balance and notifications (every 30 seconds)
  useEffect(() => {
    const refreshData = async () => {
      try {
        // Refresh user data (balance) and unread notifications count
        const [updatedUser, unreadCount] = await Promise.all([
          fetchCurrentUser().catch(() => null),
          notificationApi.getUnreadCount().catch(() => 0)
        ]);
        
        if (typeof unreadCount === 'number') {
          setUnreadNotificationCount(unreadCount);
        }
      } catch (error) {
        console.error('Failed to refresh dashboard data:', error);
      }
    };

    // Set up interval for periodic refresh
    const refreshInterval = setInterval(refreshData, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, [fetchCurrentUser]);

  // Refresh data when window comes into focus (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      // Refresh current user data when tab becomes active
      fetchCurrentUser().catch(console.error);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchCurrentUser]);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };



  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await notificationApi.markAsRead(notification.id);
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
        setUnreadNotificationCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  const handleAddMoney = () => {
    setAddMoneyLoading(true);
    setAddMoneyError(false);
    
    // Simulate processing time
    setTimeout(() => {
      setAddMoneyLoading(false);
      setAddMoneyError(true);
    }, 3000);
  };

  // Refresh notification count
  const refreshNotificationCount = async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadNotificationCount(count);
    } catch (error) {
      console.error('Failed to refresh notification count:', error);
    }
  };

  // Refresh notifications when panel is opened
  const handleShowNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Opening notifications panel, refresh data
      const fetchNotifications = async () => {
        try {
          const notificationsData = await notificationApi.getNotifications();
          setNotifications(notificationsData || []);
          await refreshNotificationCount();
        } catch (error) {
          console.error('Failed to refresh notifications:', error);
        }
      };
      fetchNotifications();
    }
  };

  return (
    <div className="min-h-screen bg-[#2c3968]">
      {/* Header */}
      <div className="bg-[#2c3968] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img src="/icons/yeet-icon.png" alt="Yeet Bank" className="w-32 h-12" />
          </div>
          
          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <LanguageSelector />
            
            {/* Notifications */}
            <button 
              onClick={handleShowNotifications}
              className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <Bell size={20} />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>
            
            {/* Support Chat */}
            <button 
              onClick={() => navigate('/chat')}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-all animate-bounce-icon"
            >
              <MessageCircle size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Full Page */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-[#2c3968] overflow-auto">
          {/* Header */}
          <div className="bg-[#2c3968] border-b border-white/10 sticky top-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Notifications Content */}
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notif) => {
                  const getNotificationIcon = (type) => {
                    switch(type) {
                      case 'welcome': return '🎉';
                      case 'security': return '🔒';
                      case 'action_required': return '⚠️';
                      case 'transaction': return '💰';
                      case 'system': return '⚙️';
                      default: return '📩';
                    }
                  };

                  const getNotificationBorder = (type, read) => {
                    if (read) return 'border-[#0a2a4a]/30';
                    switch(type) {
                      case 'welcome': return 'border-green-500/50';
                      case 'security': return 'border-red-500/50';
                      case 'action_required': return 'border-yellow-500/50';
                      case 'transaction': return 'border-blue-500/50';
                      default: return 'border-[#004aad]/50';
                    }
                  };

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-lg ${
                        notif.read
                          ? 'bg-[#071c2b]/50'
                          : 'bg-[#004aad]/20 hover:bg-[#004aad]/30'
                      } ${getNotificationBorder(notif.type, notif.read)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0 mt-1">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-white text-sm">{notif.title}</p>
                            {!notif.read && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">{notif.message}</p>
                          <p className="text-gray-500 text-xs mt-2">{notif.time || notif.created_at}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Bell className="mx-auto mb-3 text-gray-400" size={48} />
                  <p className="text-gray-400 text-lg">No notifications yet</p>
                  <p className="text-gray-500 text-sm mt-1">We'll notify you when something important happens</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transfer Type Popup */}
      {showTransferPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#071c2b] border border-[#0a2a4a] rounded-2xl shadow-2xl p-6 w-96 max-w-sm">
            <h2 className="text-xl font-bold text-white mb-4">Select Transfer Type</h2>
            <div className="space-y-3">
              <button
                onClick={() => {
                  navigate('/yeet-transfer');
                  setShowTransferPopup(false);
                }}
                className="w-full p-4 bg-[#004aad] hover:bg-[#004aad]/80 rounded-lg text-white font-semibold transition-all border border-[#004aad]/50 hover:border-[#004aad]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <Send size={18} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Yeet Bank Transfer</p>
                    <p className="text-xs text-white/70">Send to Yeet Bank users</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  navigate('/wire-transfer');
                  setShowTransferPopup(false);
                }}
                className="w-full p-4 bg-[#0a2a4a] hover:bg-[#0a2a4a]/80 rounded-lg text-white font-semibold transition-all border border-[#0a2a4a]/50 hover:border-[#0a2a4a]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <DollarSign size={18} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">External Bank Transfer</p>
                    <p className="text-xs text-white/70">Send to other banks</p>
                  </div>
                </div>
              </button>
            </div>
            <button
              onClick={() => setShowTransferPopup(false)}
              className="w-full mt-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Money Popup */}
      {showAddMoneyPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#071c2b] border border-[#0a2a4a] rounded-2xl shadow-2xl p-6 w-96 max-w-sm">
            {!addMoneyLoading && !addMoneyError && (
              <>
                <h2 className="text-xl font-bold text-white mb-4">Add Money to Account</h2>
                <div className="space-y-3">
                  <button
                    onClick={handleAddMoney}
                    className="w-full p-4 bg-[#004aad] hover:bg-[#004aad]/80 rounded-lg text-white font-semibold transition-all border border-[#004aad]/50 hover:border-[#004aad]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <DollarSign size={18} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Bank Transfer</p>
                        <p className="text-xs text-white/70">Add money via bank transfer</p>
                      </div>
                    </div>
                  </button>
                </div>
                <button
                  onClick={() => setShowAddMoneyPopup(false)}
                  className="w-full mt-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all"
                >
                  Cancel
                </button>
              </>
            )}

            {addMoneyLoading && (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-[#004aad]/30 border-t-[#004aad] rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-white mb-2">Processing...</h3>
                <p className="text-white/70">Setting up bank transfer</p>
              </div>
            )}

            {addMoneyError && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">!</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Technical Issue</h3>
                <p className="text-white/70 mb-4">
                  Due to technical difficulties, bank transfer is currently unavailable.
                </p>
                <p className="text-sm text-white/60 mb-6">
                  Please chat with our staff online for payment information or use any of our contact methods.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowAddMoneyPopup(false);
                      navigate('/chat');
                    }}
                    className="w-full p-3 bg-[#004aad] hover:bg-[#004aad]/80 rounded-lg text-white font-semibold transition-all"
                  >
                    Chat with Staff
                  </button>
                  <button
                    onClick={() => setShowAddMoneyPopup(false)}
                    className="w-full p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PWA Install Banner */}
      <InstallPromptBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Account Card */}
        <div className="bg-[#004aad] rounded-2xl shadow-xl p-8 text-white mb-8 animate-fade-in-scale">
          {/* Account Info */}
          <div className="mb-6">
            <button
              onClick={() => copyToClipboard(`${user?.account_number} | ${user?.first_name} ${user?.last_name}`, 'accountInfo')}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-all"
            >
              <span className="font-mono text-sm">
                {user?.account_number} | {user?.first_name} {user?.last_name}
              </span>
              {copiedField === 'accountInfo' ? (
                <Check size={16} className="text-green-300" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>

          {/* Balance Section */}
          <div className="mb-8">
            <p className="text-white/70 text-sm mb-2 hidden">Total Balance</p>
            <div className="flex items-center gap-3 mb-6">
              <h1 className="text-2xl font-bold">
                {showBalance ? `$${(user?.balance || 0).toLocaleString()}` : '•••'}
              </h1>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddMoneyPopup(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all font-semibold text-sm"
              >
                <Plus size={18} />
                {t('Transfer Money')}
              </button>
              <button
                onClick={() => setShowHistoryModal(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all font-semibold text-sm"
              >
                <Clock size={18} />
                History
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setShowTransferPopup(true)}
            className="bg-[#071c2b] p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-[#0a2a4a] hover:border-[#004aad] group flex flex-col items-center text-center"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2">
              <Send size={20} className="text-white" />
            </div>
            <h3 className="font-semibold text-white text-xs">Send Money</h3>
            <p className="text-gray-300 text-xs mt-0.5">Transfer to others</p>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="bg-[#071c2b] p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-[#0a2a4a] hover:border-[#004aad] group flex flex-col items-center text-center"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2">
              <Settings size={20} className="text-white" />
            </div>
            <h3 className="font-semibold text-white text-xs">{t('Settings')}</h3>
            <p className="text-gray-300 text-xs mt-0.5">Manage account</p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-[#071c2b] to-[#0a2a4a] rounded-2xl shadow-lg border border-[#0a2a4a]/50 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">{t('Recent Transactions')}</h2>
                <div className="w-10 h-10 rounded-lg bg-[#004aad]/20 flex items-center justify-center">
                  <Clock size={20} className="text-[#004aad]" />
                </div>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : !Array.isArray(recentTransactions) || recentTransactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Clock className="mx-auto mb-2" size={24} />
                    <p>No recent transactions</p>
                  </div>
                ) : (
                  recentTransactions.slice(0, 2).map((txn, idx) => (
                  <div
                    key={txn.id}
                    className="group relative overflow-hidden bg-[#071c2b]/50 hover:bg-[#0a2a4a] rounded-xl p-4 transition-all duration-300 border border-[#0a2a4a]/30 hover:border-[#004aad]/50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#004aad]/0 via-[#004aad]/5 to-[#004aad]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md transition-all duration-300 flex-shrink-0 ${
                            txn.type === 'sent'
                              ? 'bg-red-500/20 text-red-400 group-hover:bg-red-500/30'
                              : 'bg-green-500/20 text-green-400 group-hover:bg-green-500/30'
                          }`}
                        >
                          {txn.type === 'sent' ? (
                            <TrendingUp size={20} />
                          ) : (
                            <TrendingDown size={20} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">
                            {txn.type === 'sent' ? 'Sent to' : 'Received from'} {txn.user}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-400">{txn.message}</p>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                              txn.status === 'completed'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`font-bold text-sm whitespace-nowrap ${
                            txn.type === 'sent' || txn.transaction_type === 'debit' ? 'text-red-400' : 'text-green-400'
                          }`}
                        >
                          {(txn.type === 'sent' || txn.transaction_type === 'debit') ? '−' : '+'}${(txn.amount || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{txn.date || new Date(txn.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#071c2b] border border-[#0a2a4a] rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Transaction History</h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-[#004aad]/30 border-t-[#004aad] rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white/70">Loading transactions...</p>
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock size={24} className="text-white/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No Transactions Yet</h3>
                  <p className="text-white/60">Your transaction history will appear here once you start making transfers.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((txn, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0a2a4a]/30 border border-[#0a2a4a]/50 rounded-xl p-4 hover:bg-[#0a2a4a]/50 transition-all duration-300 group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md transition-all duration-300 flex-shrink-0 ${
                              txn.type === 'sent'
                                ? 'bg-red-500/20 text-red-400 group-hover:bg-red-500/30'
                                : 'bg-green-500/20 text-green-400 group-hover:bg-green-500/30'
                            }`}
                          >
                            {txn.type === 'sent' ? (
                              <TrendingUp size={20} />
                            ) : (
                              <TrendingDown size={20} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">
                              {txn.type === 'sent' ? 'Sent to' : 'Received from'} {txn.user}
                            </p>
                            <p className="text-sm text-white/60 truncate">{txn.message}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                txn.status === 'completed'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                              </span>
                              <span className="text-xs text-white/40">
                                ID: {txn.transaction_id || txn.id}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p
                            className={`font-bold text-lg whitespace-nowrap ${
                              txn.type === 'sent' || txn.transaction_type === 'debit' ? 'text-red-400' : 'text-green-400'
                            }`}
                          >
                            {(txn.type === 'sent' || txn.transaction_type === 'debit') ? '−' : '+'}${(txn.amount || 0).toLocaleString()}
                          </p>
                          <p className="text-sm text-white/60 mt-1">
                            {txn.date || new Date(txn.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-white/40 mt-1">
                            {new Date(txn.created_at || txn.date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
