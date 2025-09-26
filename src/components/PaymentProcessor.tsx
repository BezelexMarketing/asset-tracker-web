'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import {
  CreditCard,
  Security,
  CheckCircle,
  Error,
} from '@mui/icons-material';

interface PaymentProcessorProps {
  amount: number;
  currency?: string;
  description?: string;
  onSuccess?: (paymentResult: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
  clientInfo?: {
    name: string;
    email: string;
    company?: string;
  };
}

interface PaymentForm {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  email: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const SUPPORTED_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
];

export default function PaymentProcessor({
  amount,
  currency = 'USD',
  description,
  onSuccess,
  onError,
  onCancel,
  clientInfo,
}: PaymentProcessorProps) {
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: clientInfo?.name || '',
    email: clientInfo?.email || '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    },
  });

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState('card');

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add slash after 2 digits
    if (digits.length >= 2) {
      return digits.substring(0, 2) + '/' + digits.substring(2, 4);
    }
    return digits;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Card number validation (basic)
    const cardDigits = paymentForm.cardNumber.replace(/\D/g, '');
    if (!cardDigits || cardDigits.length < 13 || cardDigits.length > 19) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    // Expiry date validation
    const expiryDigits = paymentForm.expiryDate.replace(/\D/g, '');
    if (!expiryDigits || expiryDigits.length !== 4) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    } else {
      const month = parseInt(expiryDigits.substring(0, 2));
      const year = parseInt('20' + expiryDigits.substring(2, 4));
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      if (month < 1 || month > 12) {
        newErrors.expiryDate = 'Invalid month';
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    // CVV validation
    if (!paymentForm.cvv || paymentForm.cvv.length < 3 || paymentForm.cvv.length > 4) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    // Required fields
    if (!paymentForm.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    if (!paymentForm.email.trim() || !/\S+@\S+\.\S+/.test(paymentForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!paymentForm.billingAddress.street.trim()) {
      newErrors.street = 'Billing address is required';
    }

    if (!paymentForm.billingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!paymentForm.billingAddress.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'cardNumber') {
      value = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      value = formatExpiryDate(value);
    } else if (field === 'cvv') {
      value = value.replace(/\D/g, '').substring(0, 4);
    }

    if (field.startsWith('billingAddress.')) {
      const addressField = field.split('.')[1];
      setPaymentForm(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [addressField]: value,
        },
      }));
    } else {
      setPaymentForm(prev => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const processPayment = async () => {
    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate random success/failure for demo
      const success = Math.random() > 0.2; // 80% success rate

      if (success) {
        const paymentResult = {
          id: `pay_${Date.now()}`,
          amount,
          currency,
          status: 'succeeded',
          paymentMethod: {
            type: 'card',
            last4: paymentForm.cardNumber.slice(-4),
            brand: getCardBrand(paymentForm.cardNumber),
          },
          created: new Date().toISOString(),
        };

        onSuccess?.(paymentResult);
      } else {
        throw new Error('Payment failed. Please try again or use a different payment method.');
      }
    } catch (error) {
      onError?.(error);
    } finally {
      setProcessing(false);
    }
  };

  const getCardBrand = (cardNumber: string): string => {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.startsWith('4')) return 'Visa';
    if (digits.startsWith('5') || digits.startsWith('2')) return 'Mastercard';
    if (digits.startsWith('3')) return 'American Express';
    return 'Unknown';
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <Box>
      {/* Payment Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment Summary
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1">
              {description || 'Subscription Payment'}
            </Typography>
            <Typography variant="h5" color="primary">
              {formatAmount(amount, currency)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment Method
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Chip
              label="Credit Card"
              icon={<CreditCard />}
              onClick={() => setPaymentMethod('card')}
              color={paymentMethod === 'card' ? 'primary' : 'default'}
              variant={paymentMethod === 'card' ? 'filled' : 'outlined'}
            />
            <Chip
              label="PayPal"
              onClick={() => setPaymentMethod('paypal')}
              color={paymentMethod === 'paypal' ? 'primary' : 'default'}
              variant={paymentMethod === 'paypal' ? 'filled' : 'outlined'}
              disabled
            />
          </Box>

          {paymentMethod === 'card' && (
            <Grid container spacing={3}>
              {/* Card Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Card Information
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Number"
                  value={paymentForm.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  error={!!errors.cardNumber}
                  helperText={errors.cardNumber}
                  placeholder="1234 5678 9012 3456"
                  inputProps={{ maxLength: 23 }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  value={paymentForm.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  error={!!errors.expiryDate}
                  helperText={errors.expiryDate}
                  placeholder="MM/YY"
                  inputProps={{ maxLength: 5 }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="CVV"
                  value={paymentForm.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  error={!!errors.cvv}
                  helperText={errors.cvv}
                  placeholder="123"
                  inputProps={{ maxLength: 4 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cardholder Name"
                  value={paymentForm.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  error={!!errors.cardholderName}
                  helperText={errors.cardholderName}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={paymentForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>

              {/* Billing Address */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Billing Address
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={paymentForm.billingAddress.street}
                  onChange={(e) => handleInputChange('billingAddress.street', e.target.value)}
                  error={!!errors.street}
                  helperText={errors.street}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={paymentForm.billingAddress.city}
                  onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                  error={!!errors.city}
                  helperText={errors.city}
                />
              </Grid>

              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="State"
                  value={paymentForm.billingAddress.state}
                  onChange={(e) => handleInputChange('billingAddress.state', e.target.value)}
                />
              </Grid>

              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={paymentForm.billingAddress.zipCode}
                  onChange={(e) => handleInputChange('billingAddress.zipCode', e.target.value)}
                  error={!!errors.zipCode}
                  helperText={errors.zipCode}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={paymentForm.billingAddress.country}
                    onChange={(e) => handleInputChange('billingAddress.country', e.target.value)}
                  >
                    {SUPPORTED_COUNTRIES.map((country) => (
                      <MenuItem key={country.code} value={country.code}>
                        {country.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert severity="info" icon={<Security />} sx={{ mb: 3 }}>
        Your payment information is encrypted and secure. We never store your card details.
      </Alert>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={processing}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={processPayment}
          disabled={processing}
          startIcon={processing ? <CircularProgress size={20} /> : <CreditCard />}
          size="large"
        >
          {processing ? 'Processing...' : `Pay ${formatAmount(amount, currency)}`}
        </Button>
      </Box>
    </Box>
  );
}