import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Role } from '@shared/schema';
import { Loader2, Check } from 'lucide-react';

interface RoleRecommendation {
  title: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  relevanceScore: number;
}

interface RoleRecommendationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (roleData: { title: string; description: string; permissions: string[] }) => void;
  currentRoles: Role[];
}

export default function RoleRecommendationModal({
  open,
  onOpenChange,
  onSelect,
  currentRoles,
}: RoleRecommendationModalProps) {
  // Form states
  const [businessDescription, setBusinessDescription] = useState('');
  const [targetMarket, setTargetMarket] = useState<string>('enterprise');
  const [salesGoals, setSalesGoals] = useState<string>('growth');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendationsList, setRecommendationsList] = useState<RoleRecommendation[]>([]);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number | null>(null);
  const [step, setStep] = useState<'form' | 'results'>('form');

  // Generate recommendations
  const generateRecommendations = async () => {
    try {
      setIsAnalyzing(true);
      
      // Prepare existing role titles for the API
      const existingRoleTitles = currentRoles.map(role => role.title);
      
      const response = await apiRequest('POST', '/api/recommend-roles', {
        businessDescription,
        existingRoles: existingRoleTitles,
        targetMarket,
        salesGoals
      });
      
      const data = await response.json();
      setRecommendationsList(data.recommendations || []);
      setStep('results');
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle adding a selected role
  const handleAddRole = async (index: number) => {
    const role = recommendationsList[index];
    setSelectedRoleIndex(index);
    
    try {
      // Get AI-generated permissions for this role
      const response = await apiRequest('POST', '/api/generate-role-permissions', {
        roleName: role.title,
        roleDescription: role.description
      });
      
      const data = await response.json();
      
      // Call the onSelect callback with the role data
      onSelect({
        title: role.title,
        description: role.description,
        permissions: data.permissions || ['view']
      });
      
      // Close the modal
      onOpenChange(false);
      
      // Reset the form
      resetForm();
    } catch (error) {
      console.error('Error generating permissions:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setBusinessDescription('');
    setTargetMarket('enterprise');
    setSalesGoals('growth');
    setRecommendationsList([]);
    setSelectedRoleIndex(null);
    setStep('form');
  };

  // Handle cancel
  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Intelligent Role Recommendation</DialogTitle>
          <DialogDescription>
            {step === 'form' ? 
              'Describe your business and goals to get AI-powered role recommendations for your sales team.' :
              'Review recommended sales team roles based on your business needs.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'form' ? (
          <>
            <div className="grid gap-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="business-description" className="text-sm font-medium text-gray-700">
                  Business Description
                </label>
                <Textarea
                  id="business-description"
                  placeholder="Describe your business, products/services, and target customers..."
                  className="resize-none h-24"
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Include details about your industry, company size, and sales process to get more accurate recommendations.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="target-market" className="text-sm font-medium text-gray-700">
                    Target Market
                  </label>
                  <Select value={targetMarket} onValueChange={setTargetMarket}>
                    <SelectTrigger id="target-market" className="w-full">
                      <SelectValue placeholder="Select target market" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smb">Small & Medium Business</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="consumer">Consumer / B2C</SelectItem>
                      <SelectItem value="government">Government / Public Sector</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="sales-goals" className="text-sm font-medium text-gray-700">
                    Sales Goals
                  </label>
                  <Select value={salesGoals} onValueChange={setSalesGoals}>
                    <SelectTrigger id="sales-goals" className="w-full">
                      <SelectValue placeholder="Select sales goals" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="growth">Aggressive Growth</SelectItem>
                      <SelectItem value="retention">Customer Retention</SelectItem>
                      <SelectItem value="expansion">Market Expansion</SelectItem>
                      <SelectItem value="efficiency">Sales Efficiency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                onClick={generateRecommendations}
                disabled={isAnalyzing || !businessDescription.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Get Recommendations'
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-4">
                Select a role to add to your team. Recommendations are ordered by relevance for your business.
              </p>
              
              {recommendationsList.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recommendations available.</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                  {recommendationsList.map((role, index) => (
                    <div 
                      key={index}
                      className={`border rounded-sm p-4 ${selectedRoleIndex === index ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{role.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          Relevance: {role.relevanceScore}%
                        </span>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 mb-1">Key Responsibilities</h4>
                          <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                            {role.responsibilities.map((resp, i) => (
                              <li key={i}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 mb-1">Required Skills</h4>
                          <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                            {role.requiredSkills.map((skill, i) => (
                              <li key={i}>{skill}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        {selectedRoleIndex === index ? (
                          <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                            <Check className="mr-2 h-4 w-4" />
                            Selected
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleAddRole(index)}
                          >
                            Add This Role
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('form')}>
                Back
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}