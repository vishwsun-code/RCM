import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, FileText, Download } from 'lucide-react';

const Reports = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const reportTypes = [
    {
      title: 'Sales Report',
      description: 'Comprehensive sales analysis and trends',
      icon: BarChart3
    },
    {
      title: 'Purchase Report',
      description: 'Purchase order and supplier analysis',
      icon: FileText
    },
    {
      title: 'Inventory Report',
      description: 'Stock levels and batch tracking reports',
      icon: BarChart3
    },
    {
      title: 'GST Report',
      description: 'GST compliance and tax reports',
      icon: FileText
    },
    {
      title: 'Financial Report',
      description: 'P&L, balance sheet, and financial analysis',
      icon: BarChart3
    },
    {
      title: 'Customer Report',
      description: 'Customer analysis and payment reports',
      icon: FileText
    }
  ];

  return (
    <div className="space-y-6" data-testid="reports-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Generate comprehensive business reports and insights</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading reports...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report, index) => (
            <Card key={report.title} className="hover:shadow-lg transition-shadow cursor-pointer" data-testid={`report-card-${index}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <report.icon className="w-5 h-5 text-emerald-600" />
                  <span>{report.title}</span>
                </CardTitle>
                <CardDescription>
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" data-testid={`generate-report-${index}`}>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;