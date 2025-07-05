import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "./theme-toggle"
import { Settings, Key, Shield, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EnhancedAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  showModelNames: boolean;
  onToggleModelNames: (show: boolean) => void;
  hackerModeEnabled: boolean;
  onToggleHackerMode: (enabled: boolean) => void;
}

export default function EnhancedAdminPanel({ 
  isOpen, 
  onClose, 
  showModelNames, 
  onToggleModelNames, 
  hackerModeEnabled, 
  onToggleHackerMode 
}: EnhancedAdminPanelProps) {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminApiKeys, setAdminApiKeys] = useState({
    openai: "",
    gemini: "",
    deepseek: "",
    blackbox: ""
  })
  const [userApiKeys, setUserApiKeys] = useState({
    openai: "",
    gemini: "",
    deepseek: "",
    blackbox: ""
  })
  const [fullstackModeEnabled, setFullstackModeEnabled] = useState(false)
  const { toast } = useToast()

  const handlePasswordSubmit = () => {
    if (password === "Shivaay20005") {
      setIsAuthenticated(true)
      toast({
        title: "Admin Access Granted",
        description: "Welcome to Shivaay AI Admin Panel"
      })
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid admin password",
        variant: "destructive"
      })
    }
  }

  const saveAdminApiKeys = async () => {
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminApiKeys)
      })
      
      if (response.ok) {
        toast({
          title: "Admin API Keys Saved",
          description: "System-wide API keys have been updated"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save admin API keys",
        variant: "destructive"
      })
    }
  }

  const saveUserApiKeys = async () => {
    try {
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userApiKeys)
      })
      
      if (response.ok) {
        toast({
          title: "User API Keys Saved",
          description: "Your personal API keys have been updated"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save user API keys",
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
              Admin Authentication
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
              Authenticate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Shivaay AI - Enhanced Admin Panel
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="system" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="admin-apis">Admin APIs</TabsTrigger>
            <TabsTrigger value="user-apis">User APIs</TabsTrigger>
            <TabsTrigger value="modes">AI Modes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  System Settings
                </CardTitle>
                <CardDescription>
                  Global system preferences and display options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="theme-toggle">Theme Toggle</Label>
                    <p className="text-sm text-muted-foreground">Switch between dark and light themes</p>
                  </div>
                  <ThemeToggle />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="model-names">Show Model Names</Label>
                    <p className="text-sm text-muted-foreground">Display AI model names in chat responses</p>
                  </div>
                  <Switch
                    id="model-names"
                    checked={showModelNames}
                    onCheckedChange={onToggleModelNames}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="admin-apis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Admin API Keys
                </CardTitle>
                <CardDescription>
                  System-wide API keys that all users can access when their personal keys aren't set
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
                <Button onClick={saveAdminApiKeys} className="w-full">
                  Save Admin API Keys
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="user-apis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Personal API Keys
                </CardTitle>
                <CardDescription>
                  Your personal API keys (takes priority over admin keys)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="user-openai">OpenAI API Key</Label>
                    <Input
                      id="user-openai"
                      type="password"
                      value={userApiKeys.openai}
                      onChange={(e) => setUserApiKeys({...userApiKeys, openai: e.target.value})}
                      placeholder="sk-..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-gemini">Gemini API Key</Label>
                    <Input
                      id="user-gemini"
                      type="password"
                      value={userApiKeys.gemini}
                      onChange={(e) => setUserApiKeys({...userApiKeys, gemini: e.target.value})}
                      placeholder="AIza..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-deepseek">DeepSeek API Key</Label>
                    <Input
                      id="user-deepseek"
                      type="password"
                      value={userApiKeys.deepseek}
                      onChange={(e) => setUserApiKeys({...userApiKeys, deepseek: e.target.value})}
                      placeholder="sk-..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-blackbox">Blackbox AI API Key</Label>
                    <Input
                      id="user-blackbox"
                      type="password"
                      value={userApiKeys.blackbox}
                      onChange={(e) => setUserApiKeys({...userApiKeys, blackbox: e.target.value})}
                      placeholder="bb-..."
                    />
                  </div>
                </div>
                <Button onClick={saveUserApiKeys} className="w-full">
                  Save Personal API Keys
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="modes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Advanced AI Modes
                </CardTitle>
                <CardDescription>
                  Special AI modes and capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="hacker-mode">Hacker Mode</Label>
                    <p className="text-sm text-muted-foreground">Unrestricted AI responses for cybersecurity topics</p>
                  </div>
                  <Switch
                    id="hacker-mode"
                    checked={hackerModeEnabled}
                    onCheckedChange={onToggleHackerMode}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="fullstack-mode">Full Stack Developer Mode</Label>
                    <p className="text-sm text-muted-foreground">Elite programming mode using best AI models (Admin Only)</p>
                  </div>
                  <Switch
                    id="fullstack-mode"
                    checked={fullstackModeEnabled}
                    onCheckedChange={setFullstackModeEnabled}
                  />
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">RTMS Protection Active</h4>
                  <p className="text-sm text-muted-foreground">
                    Real-time model security prevents disclosure of AI model information. 
                    All responses branded as "Shivaay" - Made By Shivaay | Maintained by Shivaay | Company Aaaye
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}