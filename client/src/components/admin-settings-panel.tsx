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
import { Settings, Shield, Key, Database, Zap, Users, Brain } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  showModelNames: boolean;
  onToggleModelNames: (show: boolean) => void;
  hackerModeEnabled: boolean;
  onToggleHackerMode: (enabled: boolean) => void;
}

export default function AdminSettingsPanel({ 
  isOpen, 
  onClose, 
  showModelNames, 
  onToggleModelNames, 
  hackerModeEnabled, 
  onToggleHackerMode 
}: AdminSettingsPanelProps) {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminApiKeys, setAdminApiKeys] = useState({
    openai: "",
    gemini: "",
    deepseek: "",
    blackbox: ""
  })
  const [systemSettings, setSystemSettings] = useState({
    maxUsers: 100,
    rateLimitPerMinute: 60,
    enableRegistration: true,
    maintenanceMode: false,
    enableFileUploads: true,
    maxFileSize: 10
  })
  const { toast } = useToast()

  const handlePasswordSubmit = () => {
    if (password === "Shivaay20005") {
      setIsAuthenticated(true)
      toast({
        title: "Admin Access Granted",
        description: "Welcome to Shivaay AI Admin Settings"
      })
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid admin password",
        variant: "destructive"
      })
    }
  }

  const saveAdminSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKeys: adminApiKeys,
          systemSettings,
          displaySettings: {
            showModelNames,
            hackerModeEnabled
          }
        })
      })
      
      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Admin settings have been updated successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save admin settings",
        variant: "destructive"
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Settings Authentication
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
            </div>
            <Button onClick={handlePasswordSubmit} className="w-full">
              Access Admin Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Shivaay AI - Admin Settings Control Panel
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="system" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="ai-models">AI Models</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  System Configuration
                </CardTitle>
                <CardDescription>
                  Global system settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="theme-toggle">Theme Control</Label>
                      <p className="text-sm text-muted-foreground">Global theme toggle</p>
                    </div>
                    <ThemeToggle />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Enable system maintenance</p>
                    </div>
                    <Switch
                      id="maintenance"
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => 
                        setSystemSettings({...systemSettings, maintenanceMode: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="registration">User Registration</Label>
                      <p className="text-sm text-muted-foreground">Allow new user signups</p>
                    </div>
                    <Switch
                      id="registration"
                      checked={systemSettings.enableRegistration}
                      onCheckedChange={(checked) => 
                        setSystemSettings({...systemSettings, enableRegistration: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="file-uploads">File Uploads</Label>
                      <p className="text-sm text-muted-foreground">Enable file upload feature</p>
                    </div>
                    <Switch
                      id="file-uploads"
                      checked={systemSettings.enableFileUploads}
                      onCheckedChange={(checked) => 
                        setSystemSettings({...systemSettings, enableFileUploads: checked})
                      }
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max-users">Maximum Users</Label>
                    <Input
                      id="max-users"
                      type="number"
                      value={systemSettings.maxUsers}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings, 
                        maxUsers: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rate-limit">Rate Limit (per minute)</Label>
                    <Input
                      id="rate-limit"
                      type="number"
                      value={systemSettings.rateLimitPerMinute}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings, 
                        rateLimitPerMinute: parseInt(e.target.value)
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="api-keys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  System-wide API Keys
                </CardTitle>
                <CardDescription>
                  Configure API keys that all users can access when they don't have personal keys
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="admin-openai">OpenAI API Key</Label>
                    <Input
                      id="admin-openai"
                      type="password"
                      value={adminApiKeys.openai}
                      onChange={(e) => setAdminApiKeys({...adminApiKeys, openai: e.target.value})}
                      placeholder="sk-..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-gemini">Gemini API Key</Label>
                    <Input
                      id="admin-gemini"
                      type="password"
                      value={adminApiKeys.gemini}
                      onChange={(e) => setAdminApiKeys({...adminApiKeys, gemini: e.target.value})}
                      placeholder="AIza..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-deepseek">DeepSeek API Key</Label>
                    <Input
                      id="admin-deepseek"
                      type="password"
                      value={adminApiKeys.deepseek}
                      onChange={(e) => setAdminApiKeys({...adminApiKeys, deepseek: e.target.value})}
                      placeholder="sk-..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-blackbox">Blackbox AI API Key</Label>
                    <Input
                      id="admin-blackbox"
                      type="password"
                      value={adminApiKeys.blackbox}
                      onChange={(e) => setAdminApiKeys({...adminApiKeys, blackbox: e.target.value})}
                      placeholder="bb-..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage users and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Total Registered Users</Label>
                    <div className="text-2xl font-bold">42</div>
                    <p className="text-sm text-muted-foreground">Active users</p>
                  </div>
                  <div>
                    <Label>API Requests Today</Label>
                    <div className="text-2xl font-bold">1,247</div>
                    <p className="text-sm text-muted-foreground">Total requests</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    View All Users
                  </Button>
                  <Button variant="outline" className="w-full">
                    Export User Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ai-models" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Model Configuration
                </CardTitle>
                <CardDescription>
                  Control AI model behavior and display settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="model-names">Show Model Names</Label>
                    <p className="text-sm text-muted-foreground">Display AI model names in responses</p>
                  </div>
                  <Switch
                    id="model-names"
                    checked={showModelNames}
                    onCheckedChange={onToggleModelNames}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="hacker-mode">Dark GPT/Hacker Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable unrestricted AI responses</p>
                  </div>
                  <Switch
                    id="hacker-mode"
                    checked={hackerModeEnabled}
                    onCheckedChange={onToggleHackerMode}
                  />
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Available AI Models</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>• OpenAI GPT-4o</div>
                    <div>• Google Gemini</div>
                    <div>• DeepSeek Coder</div>
                    <div>• Blackbox AI</div>
                    <div>• Claude 3.5 Haiku</div>
                    <div>• A3Z Multi-Model</div>
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
                  Security features and system protection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">RTMS Protection Status</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Real-time model security is active. All AI responses are automatically 
                    protected from revealing model information and branded with Shivaay signatures.
                  </p>
                  <div className="text-xs text-green-600 font-medium">
                    ✓ Model Information Protected
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    ✓ Shivaay Branding Active
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    ✓ Memory Context Secured
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
                  <h4 className="font-medium mb-1">Shivaay AI System Status</h4>
                  <p className="text-sm text-muted-foreground">
                    Made By Shivaay | Maintained by Shivaay | Company Aaaye
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={saveAdminSettings}>Save All Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}