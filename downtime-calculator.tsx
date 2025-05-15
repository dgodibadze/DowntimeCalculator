/**
 * IT Downtime Cost Calculator v1.0
 * - v1.0 (2025-05-14): Initial version with dark/light theme support
 */

import React, { useState, useEffect } from 'react';

const DowntimeCalculator = () => {
  // Theme detection
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check system preference for dark mode
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);
    
    // Listen for changes in system preference
    const handleChange = (e) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handleChange);
    
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Form state
  const [formData, setFormData] = useState({
    calculationBasis: '24/7',
    annualRevenue: '',
    downtimeDuration: '',
    affectedEmployees: '',
    hourlyWage: '',
    annualOverhead: '',
    profitMargin: '',
    penaltyCost: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState(null);
  
  // Validation
  const validate = () => {
    const newErrors = {};
    
    if (!formData.annualRevenue) newErrors.annualRevenue = 'Required';
    else if (isNaN(formData.annualRevenue) || Number(formData.annualRevenue) <= 0) 
      newErrors.annualRevenue = 'Must be a positive number';
      
    if (!formData.downtimeDuration) newErrors.downtimeDuration = 'Required';
    else if (isNaN(formData.downtimeDuration) || Number(formData.downtimeDuration) <= 0) 
      newErrors.downtimeDuration = 'Must be a positive number';
      
    if (!formData.affectedEmployees) newErrors.affectedEmployees = 'Required';
    else if (isNaN(formData.affectedEmployees) || Number(formData.affectedEmployees) < 0 || !Number.isInteger(Number(formData.affectedEmployees))) 
      newErrors.affectedEmployees = 'Must be a non-negative integer';
      
    if (!formData.hourlyWage) newErrors.hourlyWage = 'Required';
    else if (isNaN(formData.hourlyWage) || Number(formData.hourlyWage) < 0) 
      newErrors.hourlyWage = 'Must be a non-negative number';
      
    if (formData.annualOverhead && (isNaN(formData.annualOverhead) || Number(formData.annualOverhead) < 0))
      newErrors.annualOverhead = 'Must be a non-negative number';
      
    if (formData.profitMargin && (isNaN(formData.profitMargin) || Number(formData.profitMargin) < 0 || Number(formData.profitMargin) > 100))
      newErrors.profitMargin = 'Must be between 0 and 100';
      
    if (formData.penaltyCost && (isNaN(formData.penaltyCost) || Number(formData.penaltyCost) < 0))
      newErrors.penaltyCost = 'Must be a non-negative number';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle radio button changes
  const handleRadioChange = (e) => {
    setFormData({
      ...formData,
      calculationBasis: e.target.value
    });
  };
  
  // Reset form
  const handleReset = () => {
    setFormData({
      calculationBasis: '24/7',
      annualRevenue: '',
      downtimeDuration: '',
      affectedEmployees: '',
      hourlyWage: '',
      annualOverhead: '',
      profitMargin: '',
      penaltyCost: ''
    });
    setErrors({});
    setResults(null);
    setShowAdvanced(false);
  };
  
  // Calculate results
  const handleCalculate = () => {
    if (!validate()) return;
    
    // Convert string inputs to numbers
    const revenue = Number(formData.annualRevenue);
    const duration = Number(formData.downtimeDuration);
    const employees = Number(formData.affectedEmployees);
    const wage = Number(formData.hourlyWage);
    const overhead = formData.annualOverhead ? Number(formData.annualOverhead) : 0;
    const margin = formData.profitMargin ? Number(formData.profitMargin) / 100 : null;
    const penalty = formData.penaltyCost ? Number(formData.penaltyCost) : 0;
    
    // Calculate annual hours based on selection
    const annualHours = formData.calculationBasis === '24/7' ? 8760 : 2000; // 8760 for 24/7, 2000 for business hours (8 * 250)
    
    // Calculate hourly revenue
    const hourlyRevenue = revenue / annualHours;
    
    // Calculate losses
    const revenueLoss = hourlyRevenue * duration;
    const profitLoss = margin !== null ? revenueLoss * margin : null;
    const productivityLoss = employees * wage * duration;
    const overheadLoss = overhead ? (overhead / annualHours) * duration : null;
    
    // Calculate total
    let total = revenueLoss + productivityLoss;
    if (profitLoss !== null) total = profitLoss; // If profit margin provided, use profit loss instead of revenue loss
    if (overheadLoss !== null) total += overheadLoss;
    if (penalty) total += penalty;
    
    setResults({
      hourlyRevenue,
      revenueLoss,
      profitLoss,
      productivityLoss,
      overheadLoss,
      penalty,
      total
    });
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Check if form is valid
  const isFormValid = () => {
    return formData.annualRevenue && 
           formData.downtimeDuration && 
           formData.affectedEmployees && 
           formData.hourlyWage &&
           Object.keys(errors).length === 0;
  };
  
  // Theme-based styles
  const themeStyles = {
    container: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      borderRadius: '8px',
      backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
      color: isDarkMode ? '#e0e0e0' : '#333333',
      boxShadow: isDarkMode ? '0 4px 12px rgba(0, 0, 0, 0.5)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease'
    },
    title: {
      textAlign: 'center',
      marginBottom: '20px',
      color: isDarkMode ? '#ffffff' : '#333333'
    },
    formGroup: {
      marginBottom: '15px'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: '500',
      color: isDarkMode ? '#e0e0e0' : '#555555'
    },
    input: {
      width: '100%',
      padding: '10px',
      borderRadius: '4px',
      border: `1px solid ${isDarkMode ? '#444444' : '#cccccc'}`,
      backgroundColor: isDarkMode ? '#333333' : '#ffffff',
      color: isDarkMode ? '#e0e0e0' : '#333333',
      transition: 'border-color 0.3s ease',
      outline: 'none'
    },
    inputError: {
      borderColor: '#e53935'
    },
    error: {
      color: '#e53935',
      fontSize: '12px',
      marginTop: '4px'
    },
    radioGroup: {
      display: 'flex',
      gap: '15px',
      marginBottom: '15px'
    },
    radioLabel: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer'
    },
    radio: {
      marginRight: '5px'
    },
    button: {
      padding: '10px 15px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'background-color 0.3s ease, opacity 0.3s ease'
    },
    primaryButton: {
      backgroundColor: isDarkMode ? '#0078d4' : '#0078d4',
      color: '#ffffff'
    },
    secondaryButton: {
      backgroundColor: isDarkMode ? '#555555' : '#e0e0e0',
      color: isDarkMode ? '#e0e0e0' : '#333333',
      marginLeft: '10px'
    },
    disabledButton: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    advancedToggle: {
      display: 'inline-block',
      marginBottom: '15px',
      color: isDarkMode ? '#4da6ff' : '#0078d4',
      cursor: 'pointer',
      textDecoration: 'none'
    },
    resultsContainer: {
      marginTop: '25px',
      padding: '15px',
      borderRadius: '4px',
      backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
      border: `1px solid ${isDarkMode ? '#444444' : '#e0e0e0'}`
    },
    resultsTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '15px',
      color: isDarkMode ? '#ffffff' : '#333333'
    },
    resultRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: `1px solid ${isDarkMode ? '#444444' : '#e0e0e0'}`
    },
    resultLabel: {
      fontWeight: '500'
    },
    resultValue: {
      fontWeight: '600'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 0',
      marginTop: '10px',
      borderTop: `2px solid ${isDarkMode ? '#666666' : '#cccccc'}`,
      fontWeight: '700',
      fontSize: '16px'
    }
  };

  return (
    <div id="downtime-calculator" style={themeStyles.container}>
      <h2 style={themeStyles.title}>IT Downtime Cost Calculator</h2>
      
      <div style={themeStyles.formGroup}>
        <label style={themeStyles.label}>Calculation Basis:</label>
        <div style={themeStyles.radioGroup}>
          <label style={themeStyles.radioLabel}>
            <input
              type="radio"
              name="calculationBasis"
              value="24/7"
              checked={formData.calculationBasis === '24/7'}
              onChange={handleRadioChange}
              style={themeStyles.radio}
            />
            24/7 (8760 hrs/yr)
          </label>
          <label style={themeStyles.radioLabel}>
            <input
              type="radio"
              name="calculationBasis"
              value="business"
              checked={formData.calculationBasis === 'business'}
              onChange={handleRadioChange}
              style={themeStyles.radio}
            />
            Business hours only (2000 hrs/yr)
          </label>
        </div>
      </div>
      
      <div style={themeStyles.formGroup}>
        <label htmlFor="annualRevenue" style={themeStyles.label}>
          Annual Revenue ($) *
        </label>
        <input
          type="text"
          id="annualRevenue"
          name="annualRevenue"
          value={formData.annualRevenue}
          onChange={handleChange}
          onBlur={validate}
          style={{
            ...themeStyles.input,
            ...(errors.annualRevenue ? themeStyles.inputError : {})
          }}
          aria-invalid={errors.annualRevenue ? 'true' : 'false'}
          aria-describedby={errors.annualRevenue ? 'annualRevenue-error' : undefined}
        />
        {errors.annualRevenue && (
          <div id="annualRevenue-error" style={themeStyles.error}>
            {errors.annualRevenue}
          </div>
        )}
      </div>
      
      <div style={themeStyles.formGroup}>
        <label htmlFor="downtimeDuration" style={themeStyles.label}>
          Downtime Duration (hours) *
        </label>
        <input
          type="text"
          id="downtimeDuration"
          name="downtimeDuration"
          value={formData.downtimeDuration}
          onChange={handleChange}
          onBlur={validate}
          style={{
            ...themeStyles.input,
            ...(errors.downtimeDuration ? themeStyles.inputError : {})
          }}
          aria-invalid={errors.downtimeDuration ? 'true' : 'false'}
          aria-describedby={errors.downtimeDuration ? 'downtimeDuration-error' : undefined}
        />
        {errors.downtimeDuration && (
          <div id="downtimeDuration-error" style={themeStyles.error}>
            {errors.downtimeDuration}
          </div>
        )}
      </div>
      
      <div style={themeStyles.formGroup}>
        <label htmlFor="affectedEmployees" style={themeStyles.label}>
          # Affected Employees *
        </label>
        <input
          type="text"
          id="affectedEmployees"
          name="affectedEmployees"
          value={formData.affectedEmployees}
          onChange={handleChange}
          onBlur={validate}
          style={{
            ...themeStyles.input,
            ...(errors.affectedEmployees ? themeStyles.inputError : {})
          }}
          aria-invalid={errors.affectedEmployees ? 'true' : 'false'}
          aria-describedby={errors.affectedEmployees ? 'affectedEmployees-error' : undefined}
        />
        {errors.affectedEmployees && (
          <div id="affectedEmployees-error" style={themeStyles.error}>
            {errors.affectedEmployees}
          </div>
        )}
      </div>
      
      <div style={themeStyles.formGroup}>
        <label htmlFor="hourlyWage" style={themeStyles.label}>
          Average Hourly Wage ($) *
        </label>
        <input
          type="text"
          id="hourlyWage"
          name="hourlyWage"
          value={formData.hourlyWage}
          onChange={handleChange}
          onBlur={validate}
          style={{
            ...themeStyles.input,
            ...(errors.hourlyWage ? themeStyles.inputError : {})
          }}
          aria-invalid={errors.hourlyWage ? 'true' : 'false'}
          aria-describedby={errors.hourlyWage ? 'hourlyWage-error' : undefined}
        />
        {errors.hourlyWage && (
          <div id="hourlyWage-error" style={themeStyles.error}>
            {errors.hourlyWage}
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); setShowAdvanced(!showAdvanced); }}
          style={themeStyles.advancedToggle}
        >
          {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
        </a>
      </div>
      
      {showAdvanced && (
        <>
          <div style={themeStyles.formGroup}>
            <label htmlFor="annualOverhead" style={themeStyles.label}>
              Annual Overhead Cost ($)
            </label>
            <input
              type="text"
              id="annualOverhead"
              name="annualOverhead"
              value={formData.annualOverhead}
              onChange={handleChange}
              onBlur={validate}
              style={{
                ...themeStyles.input,
                ...(errors.annualOverhead ? themeStyles.inputError : {})
              }}
              aria-invalid={errors.annualOverhead ? 'true' : 'false'}
              aria-describedby={errors.annualOverhead ? 'annualOverhead-error' : undefined}
            />
            {errors.annualOverhead && (
              <div id="annualOverhead-error" style={themeStyles.error}>
                {errors.annualOverhead}
              </div>
            )}
          </div>
          
          <div style={themeStyles.formGroup}>
            <label htmlFor="profitMargin" style={themeStyles.label}>
              Profit Margin (%)
            </label>
            <input
              type="text"
              id="profitMargin"
              name="profitMargin"
              value={formData.profitMargin}
              onChange={handleChange}
              onBlur={validate}
              style={{
                ...themeStyles.input,
                ...(errors.profitMargin ? themeStyles.inputError : {})
              }}
              aria-invalid={errors.profitMargin ? 'true' : 'false'}
              aria-describedby={errors.profitMargin ? 'profitMargin-error' : undefined}
            />
            {errors.profitMargin && (
              <div id="profitMargin-error" style={themeStyles.error}>
                {errors.profitMargin}
              </div>
            )}
          </div>
          
          <div style={themeStyles.formGroup}>
            <label htmlFor="penaltyCost" style={themeStyles.label}>
              Compliance/Penalty Cost ($)
            </label>
            <input
              type="text"
              id="penaltyCost"
              name="penaltyCost"
              value={formData.penaltyCost}
              onChange={handleChange}
              onBlur={validate}
              style={{
                ...themeStyles.input,
                ...(errors.penaltyCost ? themeStyles.inputError : {})
              }}
              aria-invalid={errors.penaltyCost ? 'true' : 'false'}
              aria-describedby={errors.penaltyCost ? 'penaltyCost-error' : undefined}
            />
            {errors.penaltyCost && (
              <div id="penaltyCost-error" style={themeStyles.error}>
                {errors.penaltyCost}
              </div>
            )}
          </div>
        </>
      )}
      
      <div style={{ marginTop: '25px' }}>
        <button
          onClick={handleCalculate}
          disabled={!isFormValid()}
          style={{
            ...themeStyles.button,
            ...themeStyles.primaryButton,
            ...(!isFormValid() ? themeStyles.disabledButton : {})
          }}
          aria-disabled={!isFormValid()}
        >
          Calculate
        </button>
        <button
          onClick={handleReset}
          style={{
            ...themeStyles.button,
            ...themeStyles.secondaryButton
          }}
        >
          Reset
        </button>
      </div>
      
      {results && (
        <div style={themeStyles.resultsContainer}>
          <h3 style={themeStyles.resultsTitle}>Downtime Cost Results</h3>
          
          <div style={themeStyles.resultRow}>
            <span style={themeStyles.resultLabel}>Hourly Revenue Rate:</span>
            <span style={themeStyles.resultValue}>{formatCurrency(results.hourlyRevenue)}</span>
          </div>
          
          {results.profitLoss !== null ? (
            <div style={themeStyles.resultRow}>
              <span style={themeStyles.resultLabel}>Profit Loss:</span>
              <span style={themeStyles.resultValue}>{formatCurrency(results.profitLoss)}</span>
            </div>
          ) : (
            <div style={themeStyles.resultRow}>
              <span style={themeStyles.resultLabel}>Revenue Loss:</span>
              <span style={themeStyles.resultValue}>{formatCurrency(results.revenueLoss)}</span>
            </div>
          )}
          
          <div style={themeStyles.resultRow}>
            <span style={themeStyles.resultLabel}>Productivity Loss:</span>
            <span style={themeStyles.resultValue}>{formatCurrency(results.productivityLoss)}</span>
          </div>
          
          {results.overheadLoss !== null && (
            <div style={themeStyles.resultRow}>
              <span style={themeStyles.resultLabel}>Overhead Loss:</span>
              <span style={themeStyles.resultValue}>{formatCurrency(results.overheadLoss)}</span>
            </div>
          )}
          
          {results.penalty > 0 && (
            <div style={themeStyles.resultRow}>
              <span style={themeStyles.resultLabel}>Compliance/Penalty Cost:</span>
              <span style={themeStyles.resultValue}>{formatCurrency(results.penalty)}</span>
            </div>
          )}
          
          <div style={themeStyles.totalRow}>
            <span>Total Estimated Cost:</span>
            <span>{formatCurrency(results.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DowntimeCalculator;
