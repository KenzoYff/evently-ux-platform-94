import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useTwoFactor } from '@/hooks/useTwoFactor';
import { Shield, RefreshCw } from 'lucide-react';

interface TwoFactorVerificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
}

const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  open,
  onOpenChange,
  onVerified,
}) => {
  const [code, setCode] = useState('');
  const { loading, sendTwoFactorCode, verifyTwoFactorCode } = useTwoFactor();

  const handleSendCode = async () => {
    await sendTwoFactorCode();
  };

  const handleVerify = async () => {
    if (code.length === 6) {
      const isValid = await verifyTwoFactorCode(code);
      if (isValid) {
        onVerified();
        onOpenChange(false);
        setCode('');
      }
    }
  };

  React.useEffect(() => {
    if (open) {
      handleSendCode();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Verificação em Duas Etapas
          </DialogTitle>
          <DialogDescription>
            Digite o código de 6 dígitos enviado para seu email
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              value={code}
              onChange={setCode}
              maxLength={6}
              disabled={loading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleVerify} 
              disabled={loading || code.length !== 6}
              className="w-full"
            >
              {loading ? 'Verificando...' : 'Verificar Código'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleSendCode}
              disabled={loading}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reenviar Código
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorVerification;