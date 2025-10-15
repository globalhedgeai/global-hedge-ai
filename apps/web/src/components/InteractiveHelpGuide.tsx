'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/translations';

interface HelpStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'scroll' | 'wait';
  nextStep?: string;
}

interface HelpGuide {
  id: string;
  title: string;
  description: string;
  steps: HelpStep[];
  category: 'getting-started' | 'deposits' | 'withdrawals' | 'rewards' | 'reports' | 'dashboard';
}

const HELP_GUIDES: HelpGuide[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using the platform',
    category: 'getting-started',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome',
        description: 'This is your dashboard where you can see your balance and access all features.',
        target: '[data-help="dashboard"]',
        position: 'bottom'
      },
      {
        id: 'balance',
        title: 'Balance',
        description: 'Your current balance is displayed here',
        target: '[data-help="balance"]',
        position: 'right'
      },
      {
        id: 'navigation',
        title: 'Navigation Menu',
        description: 'Use this menu to navigate between different sections of the platform.',
        target: '[data-help="navigation"]',
        position: 'bottom'
      }
    ]
  },
  {
    id: 'deposits',
    title: 'Making Deposits',
    description: 'Learn how to deposit cryptocurrency to your account',
    category: 'deposits',
    steps: [
      {
        id: 'deposit-page',
        title: 'Deposit Page',
        description: 'Click here to access the deposit page.',
        target: '[data-help="deposit-link"]',
        position: 'bottom',
        action: 'click'
      },
      {
        id: 'select-crypto',
        title: 'Select Cryptocurrency',
        description: 'Choose which cryptocurrency you want to deposit.',
        target: '[data-help="crypto-select"]',
        position: 'bottom'
      },
      {
        id: 'wallet-address',
        title: 'Wallet Address',
        description: 'Copy this address to send your cryptocurrency.',
        target: '[data-help="wallet-address"]',
        position: 'right'
      },
      {
        id: 'qr-code',
        title: 'QR Code',
        description: 'Scan this QR code with your mobile wallet for easy copying.',
        target: '[data-help="qr-code"]',
        position: 'left'
      },
      {
        id: 'deposit-form',
        title: 'Deposit Form',
        description: 'Fill in the amount and transaction ID, then upload proof.',
        target: '[data-help="deposit-form"]',
        position: 'top'
      }
    ]
  },
  {
    id: 'rewards',
    title: 'Rewards',
    description: 'Learn how to claim your daily and random rewards',
    category: 'rewards',
    steps: [
      {
        id: 'daily-reward',
        title: 'Daily Reward',
        description: 'Claim your daily reward every 24 hours.',
        target: '[data-help="daily-reward"]',
        position: 'bottom'
      },
      {
        id: 'random-reward',
        title: 'Random Reward',
        description: 'Try your luck with random rewards that appear periodically.',
        target: '[data-help="random-reward"]',
        position: 'bottom'
      }
    ]
  },
  {
    id: 'reports',
    title: 'Financial Reports',
    description: 'Learn how to view your financial performance',
    category: 'reports',
    steps: [
      {
        id: 'reports-page',
        title: 'Reports Page',
        description: 'Click here to view detailed financial reports.',
        target: '[data-help="reports-link"]',
        position: 'bottom',
        action: 'click'
      },
      {
        id: 'period-selector',
        title: 'Select Time Period',
        description: 'Choose the time period for your reports.',
        target: '[data-help="period-selector"]',
        position: 'bottom'
      },
      {
        id: 'performance-metrics',
        title: 'Performance Metrics',
        description: 'View your profit, reward rate, and other key metrics.',
        target: '[data-help="performance-metrics"]',
        position: 'top'
      }
    ]
  }
];

export default function InteractiveHelpGuide() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentGuide, setCurrentGuide] = useState<HelpGuide | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isGuiding, setIsGuiding] = useState(false);
  const [overlay, setOverlay] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (isGuiding && currentGuide) {
      const step = currentGuide.steps[currentStepIndex];
      highlightElement(step.target);
    }
  }, [isGuiding, currentGuide, currentStepIndex]);

  const highlightElement = (selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setOverlay({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      });
    }
  };

  const startGuide = (guide: HelpGuide) => {
    setCurrentGuide(guide);
    setCurrentStepIndex(0);
    setIsGuiding(true);
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentGuide && currentStepIndex < currentGuide.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      finishGuide();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const finishGuide = () => {
    setIsGuiding(false);
    setCurrentGuide(null);
    setCurrentStepIndex(0);
    setOverlay(null);
  };

  const skipGuide = () => {
    finishGuide();
  };

  const currentStep = currentGuide?.steps[currentStepIndex];

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        title={t('help.title')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-success text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          ?
        </span>
      </button>

      {/* Help Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{t('help.title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('help.subtitle')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {HELP_GUIDES.map((guide) => (
                  <div
                    key={guide.id}
                    className="card hover-lift cursor-pointer"
                    onClick={() => startGuide(guide)}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-foreground">{guide.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{guide.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {guide.steps.length} {t('help.steps')}
                        </span>
                        <button className="btn-primary text-sm px-3 py-1">
                          {t('help.start')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Tips */}
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">{t('help.quickTips')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{t('help.tip1.title')}</h4>
                      <p className="text-sm text-muted-foreground">{t('help.tip1.description')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-warning/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{t('help.tip2.title')}</h4>
                      <p className="text-sm text-muted-foreground">{t('help.tip2.description')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-info/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{t('help.tip3.title')}</h4>
                      <p className="text-sm text-muted-foreground">{t('help.tip3.description')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{t('help.tip4.title')}</h4>
                      <p className="text-sm text-muted-foreground">{t('help.tip4.description')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Guide Overlay */}
      {isGuiding && currentStep && (
        <>
          {/* Dark Overlay */}
          <div className="fixed inset-0 z-50 bg-black/70" />
          
          {/* Highlighted Element */}
          {overlay && (
            <div
              className="fixed z-50 border-2 border-primary rounded-lg shadow-lg"
              style={{
                left: overlay.x - 4,
                top: overlay.y - 4,
                width: overlay.width + 8,
                height: overlay.height + 8,
              }}
            />
          )}

          {/* Guide Tooltip */}
          <div className="fixed z-50 bg-card border border-border rounded-lg shadow-xl max-w-sm p-4"
               style={{
                 left: overlay ? Math.min(overlay.x + overlay.width + 20, window.innerWidth - 320) : 20,
                 top: overlay ? Math.max(overlay.y - 20, 20) : 20,
               }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">{currentStepIndex + 1}</span>
                </div>
                <h3 className="font-semibold text-foreground">{currentStep.title}</h3>
              </div>
              <button
                onClick={skipGuide}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">{currentStep.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  className="btn-secondary text-sm px-3 py-1 disabled:opacity-50"
                >
                  {t('help.previous')}
                </button>
                <button
                  onClick={nextStep}
                  className="btn-primary text-sm px-3 py-1"
                >
                  {currentStepIndex === currentGuide!.steps.length - 1 ? t('help.finish') : t('help.next')}
                </button>
              </div>
              <span className="text-xs text-muted-foreground">
                {currentStepIndex + 1} / {currentGuide!.steps.length}
              </span>
            </div>
          </div>
        </>
      )}
    </>
  );
}
