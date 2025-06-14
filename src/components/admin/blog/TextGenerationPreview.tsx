
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const TextGenerationPreview: React.FC = () => {
  return (
    <div className="space-y-4 p-4 border rounded-md">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>AI İçerik Oluşturma</AlertTitle>
        <AlertDescription>
          AI içerik oluşturma özelliği şu anda kullanılabilir değil. 
          Lütfen blog içeriklerinizi manuel olarak oluşturunuz.
        </AlertDescription>
      </Alert>
      
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">
          Bu özellik geçici olarak kaldırılmıştır. Daha sonra iyileştirilmiş bir versiyonu eklenecektir.
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => alert("Bu özellik şu an kullanılamıyor.")}
          disabled
        >
          İçerik Oluştur
        </Button>
      </div>
    </div>
  );
};

export default TextGenerationPreview;
