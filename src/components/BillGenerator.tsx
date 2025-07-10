
import React from 'react';
import { Driver } from '@/utils/dataManager';

interface BillData {
  driver: Driver;
  weekStart: string;
  weekEnd: string;
  earnings: {
    weeklyEarning: string;
    cash: string;
    tax: string;
    toll: string;
    rent: string;
    adjustment: string;
    other: string;
  };
  totalAmount: number;
}

export const generateBillPNG = async (billData: BillData): Promise<void> => {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Set canvas dimensions
  canvas.width = 800;
  canvas.height = 1000;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 100);
  gradient.addColorStop(0, '#7c3aed');
  gradient.addColorStop(1, '#a855f7');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, 100);

  // Company title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('RANGREJ FLEET', canvas.width / 2, 45);
  
  ctx.font = '16px Arial, sans-serif';
  ctx.fillText('Weekly Earnings Statement', canvas.width / 2, 75);

  // Date and time
  ctx.fillStyle = '#666666';
  ctx.font = '14px Arial, sans-serif';
  ctx.textAlign = 'right';
  const currentDate = new Date().toLocaleString();
  ctx.fillText(`Generated: ${currentDate}`, canvas.width - 40, 130);

  // Driver details section
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Driver Information', 40, 180);

  ctx.font = '16px Arial, sans-serif';
  ctx.fillText(`Name: ${billData.driver.name}`, 40, 210);
  ctx.fillText(`Mobile: ${billData.driver.mobile}`, 40, 235);
  ctx.fillText(`Week: ${new Date(billData.weekStart).toLocaleDateString()} - ${new Date(billData.weekEnd).toLocaleDateString()}`, 40, 260);

  // Earnings breakdown section
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.fillText('Earnings Breakdown', 40, 320);

  // Table header
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(40, 340, canvas.width - 80, 40);
  ctx.strokeStyle = '#e9ecef';
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 340, canvas.width - 80, 40);

  ctx.fillStyle = '#333333';
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.fillText('Description', 60, 365);
  ctx.textAlign = 'center';
  ctx.fillText('Type', 400, 365);
  ctx.textAlign = 'right';
  ctx.fillText('Amount (₹)', canvas.width - 80, 365);

  // Table rows
  const rows = [
    { desc: 'Weekly Earning', type: '+', amount: billData.earnings.weeklyEarning || '0', color: '#16a34a' },
    { desc: 'Cash Deduction', type: '-', amount: billData.earnings.cash || '0', color: '#dc2626' },
    { desc: 'Tax Deduction', type: '-', amount: billData.earnings.tax || '0', color: '#dc2626' },
    { desc: 'Toll Addition', type: '+', amount: billData.earnings.toll || '0', color: '#16a34a' },
    { desc: 'Rent Deduction', type: '-', amount: billData.earnings.rent || '0', color: '#dc2626' },
  ];

  if (billData.earnings.adjustment && parseFloat(billData.earnings.adjustment) > 0) {
    rows.push({ desc: 'Adjustment', type: '+', amount: billData.earnings.adjustment, color: '#16a34a' });
  }
  if (billData.earnings.other && parseFloat(billData.earnings.other) > 0) {
    rows.push({ desc: 'Other Deduction', type: '-', amount: billData.earnings.other, color: '#dc2626' });
  }

  let yPos = 380;
  ctx.font = '14px Arial, sans-serif';
  
  rows.forEach((row, index) => {
    // Alternate row background
    if (index % 2 === 0) {
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(40, yPos, canvas.width - 80, 30);
    }
    
    // Row border
    ctx.strokeStyle = '#e9ecef';
    ctx.strokeRect(40, yPos, canvas.width - 80, 30);
    
    // Text
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'left';
    ctx.fillText(row.desc, 60, yPos + 20);
    
    ctx.fillStyle = row.color;
    ctx.textAlign = 'center';
    ctx.fillText(row.type, 400, yPos + 20);
    
    ctx.textAlign = 'right';
    ctx.fillText(row.amount, canvas.width - 80, yPos + 20);
    
    yPos += 30;
  });

  // Total section
  yPos += 20;
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(40, yPos, canvas.width - 80, 50);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Net Amount: ₹${billData.totalAmount.toFixed(2)}`, canvas.width / 2, yPos + 32);

  // Footer
  yPos += 100;
  ctx.fillStyle = '#666666';
  ctx.font = '12px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('This is a computer generated statement', canvas.width / 2, yPos);
  ctx.fillText('Rangrej Fleet Management System', canvas.width / 2, yPos + 20);

  // Convert canvas to blob and download
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${billData.driver.name}_Weekly_Earnings_${billData.weekStart}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, 'image/png');
};
