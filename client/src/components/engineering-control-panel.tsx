import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "./theme-toggle"
import { Settings, Cpu, Database, Code, Shield, Zap, Brain, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EngineeringControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EngineeringControlPanel({ isOpen, onClose }: EngineeringControlPanelProps) {
  const [selectedAIProvider, setSelectedAIProvider] = useState("auto")
  const [responseFormat, setResponseFormat] = useState("comprehensive")
  const [engineeringDiscipline, setEngineeringDiscipline] = useState("general")
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    gemini: "",
    deepseek: "",
    blackbox: ""
  })
  const [advancedSettings, setAdvancedSettings] = useState({
    rtmsProtection: true,
    memoryContext: true,
    webSearch: true,
    fileAnalysis: true,
    codeExecution: false,
    securityMode: false
  })
  const { toast } = useToast()

  const saveSettings = async () => {
    try {
      const response = await fetch('/api/engineering/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiProvider: selectedAIProvider,
          responseFormat,
          engineeringDiscipline,
          apiKeys,
          advancedSettings
        })
      })
      
      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Engineering control settings updated successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Shivaay Engineering Control Center
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="ai-models" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="ai-models">AI Models</TabsTrigger>
            <TabsTrigger value="engineering">Engineering</TabsTrigger>
            <TabsTrigger value="development">Development</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ai-models" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Model Configuration
                </CardTitle>
                <CardDescription>
                  Configure AI providers and models for optimal engineering assistance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ai-provider">Primary AI Provider</Label>
                    <Select value={selectedAIProvider} onValueChange={setSelectedAIProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select AI Provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-Select Best Model</SelectItem>
                        <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                        <SelectItem value="gemini">Google Gemini</SelectItem>
                        <SelectItem value="deepseek">DeepSeek Coder</SelectItem>
                        <SelectItem value="blackbox">Blackbox AI</SelectItem>
                        <SelectItem value="a3z">A3Z Multi-Model</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="response-format">Response Format</Label>
                    <Select value={responseFormat} onValueChange={setResponseFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                        <SelectItem value="technical">Technical Focus</SelectItem>
                        <SelectItem value="practical">Practical Solutions</SelectItem>
                        <SelectItem value="academic">Academic Detail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <Input
                      id="openai-key"
                      type="password"
                      value={apiKeys.openai}
                      onChange={(e) => setApiKeys({...apiKeys, openai: e.target.value})}
                      placeholder="sk-..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="gemini-key">Gemini API Key</Label>
                    <Input
                      id="gemini-key"
                      type="password"
                      value={apiKeys.gemini}
                      onChange={(e) => setApiKeys({...apiKeys, gemini: e.target.value})}
                      placeholder="AIza..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="deepseek-key">DeepSeek API Key</Label>
                    <Input
                      id="deepseek-key"
                      type="password"
                      value={apiKeys.deepseek}
                      onChange={(e) => setApiKeys({...apiKeys, deepseek: e.target.value})}
                      placeholder="sk-..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="blackbox-key">Blackbox AI API Key</Label>
                    <Input
                      id="blackbox-key"
                      type="password"
                      value={apiKeys.blackbox}
                      onChange={(e) => setApiKeys({...apiKeys, blackbox: e.target.value})}
                      placeholder="bb-..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="engineering" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  Engineering Specialization
                </CardTitle>
                <CardDescription>
                  Configure engineering discipline focus and capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="engineering-discipline">Primary Engineering Discipline</Label>
                  <Select value={engineeringDiscipline} onValueChange={setEngineeringDiscipline}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Discipline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Engineering</SelectItem>
                      <SelectItem value="mechanical">Mechanical Engineering</SelectItem>
                      <SelectItem value="electrical">Electrical Engineering</SelectItem>
                      <SelectItem value="civil">Civil Engineering</SelectItem>
                      <SelectItem value="software">Software Engineering</SelectItem>
                      <SelectItem value="aerospace">Aerospace Engineering</SelectItem>
                      <SelectItem value="chemical">Chemical Engineering</SelectItem>
                      <SelectItem value="biomedical">Biomedical Engineering</SelectItem>
                      <SelectItem value="environmental">Environmental Engineering</SelectItem>
                      <SelectItem value="industrial">Industrial Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="calculations">Advanced Calculations</Label>
                      <p className="text-sm text-muted-foreground">Enable complex mathematical modeling</p>
                    </div>
                    <Switch
                      id="calculations"
                      checked={advancedSettings.memoryContext}
                      onCheckedChange={(checked) => 
                        setAdvancedSettings({...advancedSettings, memoryContext: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="web-search">Technical Research</Label>
                      <p className="text-sm text-muted-foreground">Access latest technical documentation</p>
                    </div>
                    <Switch
                      id="web-search"
                      checked={advancedSettings.webSearch}
                      onCheckedChange={(checked) => 
                        setAdvancedSettings({...advancedSettings, webSearch: checked})
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="development" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Development Tools
                </CardTitle>
                <CardDescription>
                  Programming and development assistance configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="file-analysis">File Analysis</Label>
                      <p className="text-sm text-muted-foreground">Analyze uploaded files and documents</p>
                    </div>
                    <Switch
                      id="file-analysis"
                      checked={advancedSettings.fileAnalysis}
                      onCheckedChange={(checked) => 
                        setAdvancedSettings({...advancedSettings, fileAnalysis: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="code-execution">Code Execution</Label>
                      <p className="text-sm text-muted-foreground">Enable code compilation and execution</p>
                    </div>
                    <Switch
                      id="code-execution"
                      checked={advancedSettings.codeExecution}
                      onCheckedChange={(checked) => 
                        setAdvancedSettings({...advancedSettings, codeExecution: checked})
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security & Privacy
                </CardTitle>
                <CardDescription>
                  Security features and privacy controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="rtms-protection">RTMS Protection</Label>
                      <p className="text-sm text-muted-foreground">Prevent AI model information disclosure</p>
                    </div>
                    <Switch
                      id="rtms-protection"
                      checked={advancedSettings.rtmsProtection}
                      onCheckedChange={(checked) => 
                        setAdvancedSettings({...advancedSettings, rtmsProtection: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="security-mode">Security Analysis Mode</Label>
                      <p className="text-sm text-muted-foreground">Enable cybersecurity and penetration testing</p>
                    </div>
                    <Switch
                      id="security-mode"
                      checked={advancedSettings.securityMode}
                      onCheckedChange={(checked) => 
                        setAdvancedSettings({...advancedSettings, securityMode: checked})
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Advanced Settings
                </CardTitle>
                <CardDescription>
                  System preferences and advanced configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="theme-toggle">Theme</Label>
                    <p className="text-sm text-muted-foreground">Switch between dark and light themes</p>
                  </div>
                  <ThemeToggle />
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Shivaay Engineering AI Status</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Complete engineering control center with unified AI capabilities
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Made By Shivaay | Maintained by Shivaay | Company Aaaye
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={saveSettings}>Save Configuration</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}