import { useState } from "react";
import { Settings, Eye, EyeOff, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  showModelNames: boolean;
  onToggleModelNames: (show: boolean) => void;
}

export default function AdminPanel({ 
  isOpen, 
  onClose, 
  showModelNames, 
  onToggleModelNames 
}: AdminPanelProps) {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = () => {
    if (password === "Shivaay20005") {
      setIsAuthenticated(true);
    } else {
      alert("गलत password! सही password डालें.");
    }
  };

  const handleClose = () => {
    setIsAuthenticated(false);
    setPassword("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-dark-secondary border border-gray-600 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-purple-primary" />
            <span>Admin Panel</span>
          </DialogTitle>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted mb-2 block">
                Admin Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password डालें..."
                  className="bg-dark-tertiary border-gray-600 text-white pr-10"
                  onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 
                    <EyeOff className="w-4 h-4 text-muted" /> : 
                    <Eye className="w-4 h-4 text-muted" />
                  }
                </Button>
              </div>
            </div>
            <Button 
              onClick={handleAuth}
              className="w-full bg-purple-primary hover:bg-purple-600"
            >
              Login
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-dark-tertiary p-4 rounded-lg">
              <h3 className="text-sm font-semibold mb-3 text-green-400">
                ✓ Admin Access Granted
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-white">
                      Model Names दिखाएं
                    </label>
                    <p className="text-xs text-muted">
                      Messages के नीचे model का name show/hide करें
                    </p>
                  </div>
                  <Switch
                    checked={showModelNames}
                    onCheckedChange={onToggleModelNames}
                  />
                </div>

                <div className="pt-2 border-t border-gray-600">
                  <h4 className="text-xs font-medium text-muted mb-2">
                    Current Settings:
                  </h4>
                  <ul className="text-xs text-muted space-y-1">
                    <li>• Model Names: {showModelNames ? "Visible" : "Hidden"}</li>
                    <li>• Auto-Select: Enabled</li>
                    <li>• Web Search: Active</li>
                    <li>• File Upload: Enabled</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleClose}
              variant="outline"
              className="w-full border-gray-600 text-white hover:bg-gray-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save & Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}