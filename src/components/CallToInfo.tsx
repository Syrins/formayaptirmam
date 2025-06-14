import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { HomepageContent } from "@/types/blog";

const CallToInfo: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  return (
    <section className="py-16 md:py-20 bg-gradient-to-r from-blue-600 to-purple-700 dark:from-gray-800 dark:to-gray-900 text-white dark:text-gray-100 rounded-lg shadow-xl">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight text-white dark:text-gray-100">
            Forma Tasarla: <br className="md:hidden"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-500 dark:from-green-400 dark:to-green-600">Takımınıza Özel Tasarımlarla Sahaya Çıkın!</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 dark:text-gray-200 max-w-2xl mx-auto">
            Futbol takımlarınız için hayalinizdeki formayı tasarlamak artık çok kolay! AcunSport, dayanıklı ve hafif kumaşlarla hazırlanan, tamamen kişiselleştirilebilir formalar sunuyor. Üstelik, hızlı teslimat ve geniş özelleştirme seçenekleriyle takımınızın ruhunu sahaya yansıtabilirsiniz.
          </p>
        </div>

        {/* Neden Forma Tasarımı Önemlidir? */}
        <div className="bg-white/10 dark:bg-gray-700/20 p-8 rounded-lg mb-12 shadow-inner">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white dark:text-gray-100">
            Forma Tasarımı Neden Önemlidir?
          </h2>
          <p className="text-lg text-white/90 dark:text-gray-200 mb-6">
            Forma tasarımı, sadece bir giysi olmaktan öte, **takım ruhunu güçlendiren** ve oyuncu performansını doğrudan etkileyen kritik bir unsurdur. Hem konforlu hem de uzun süre dayanıklı bir forma seçimi, sahadaki fark yaratır. İşte AcunSport'un sunduğu temel avantajlar:
          </p>
          <ul className="list-disc list-inside space-y-3 text-lg text-white/95 dark:text-gray-200">
            <li><strong className="text-green-300 dark:text-green-400">Dayanıklı Kumaşlar:</strong> Yıpranmalara ve yoğun kullanıma karşı üstün direnç gösteren, uzun ömürlü formalar.</li>
            <li><strong className="text-green-300 dark:text-green-400">Hafif ve Rahat Kullanım:</strong> Hava alabilen özel kumaşlar sayesinde oyun sırasında maksimum konfor ve serinlik sağlanır.</li>
            <li><strong className="text-green-300 dark:text-green-400">Kişisel Tasarım Seçenekleri:</strong> Formanızı takımınızın kimliğine uygun hale getirmek için isim, numara ve sponsor logosu ekleme imkanı.</li>
          </ul>
        </div>

        {/* AcunSport ile Forma Dizaynının Avantajları */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white dark:text-gray-100">
            AcunSport ile Forma Dizaynının Avantajları
          </h2>
          <p className="text-lg text-white/90 dark:text-gray-200 mb-6 text-center">
            AcunSport, kolay kullanımı, hızlı hizmeti ve kalitesiyle forma tasarım sürecinizi keyifli bir deneyime dönüştürüyor:
          </p>
          <div className="grid md:grid-cols-2 gap-8 text-center md:text-left">
            <div className="bg-white/10 dark:bg-gray-700/20 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-green-300 dark:text-green-400">Kolay Tasarım Araçları</h3>
              <p className="text-white/95 dark:text-gray-200">Kullanıcı dostu arayüzümüz sayesinde renklerinizi seçmek, logoları eklemek ve tasarımlarınızı oluşturmak saniyeler içinde tamamlanır.</p>
            </div>
            <div className="bg-white/10 dark:bg-gray-700/20 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-green-300 dark:text-green-400">Hızlı Teslimat</h3>
              <p className="text-white/95 dark:text-gray-200">Siparişleriniz özenle hazırlanır ve yalnızca **7 iş günü içinde** kapınıza teslim edilir. Zaman bizim için değerli, sizin için de öyle!</p>
            </div>
            <div className="bg-white/10 dark:bg-gray-700/20 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-green-300 dark:text-green-400">Uzun Süreli Kullanım</h3>
              <p className="text-white/95 dark:text-gray-200">Anti-bakteriyel ve terletmeyen özel kumaşlar sayesinde formalarınız uzun süre ilk günkü gibi kalır.</p>
            </div>
            <div className="bg-white/10 dark:bg-gray-700/20 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-green-300 dark:text-green-400">Profesyonel Destek</h3>
              <p className="text-white/95 dark:text-gray-200">Tasarım ve üretim sürecinin her aşamasında size yardımcı olacak uzman ekibimiz her zaman yanınızdadır.</p>
            </div>
          </div>
        </div>

        {/* Forma Tasarlama Sipariş Süreci Adım Adım */}
        <div className="bg-white/10 dark:bg-gray-700/20 p-8 rounded-lg mb-12 shadow-inner">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white dark:text-gray-100">
            Forma Tasarlama Sipariş Süreci Adım Adım
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-lg text-white/95 dark:text-gray-200 pl-4">
            <li><strong className="text-green-300 dark:text-green-400">Tasarımı Başlatın:</strong> Beğendiğiniz renkleri ve desenleri seçerek ilk adımı atın.</li>
            <li><strong className="text-green-300 dark:text-green-400">Logo ve Yazı Ekleyin:</strong> Takım logonuzu, sponsor bilgilerinizi ve oyuncu isimlerini kolayca ekleyin.</li>
            <li><strong className="text-green-300 dark:text-green-400">Siparişinizi Onaylayın:</strong> Uzmanlarımız tasarımınızı titizlikle gözden geçirir ve üretim sürecini başlatır.</li>
            <li><strong className="text-green-300 dark:text-green-400">Teslimat:</strong> Yeni formalarınız hızlıca ve güvenle adresinize gönderilir.</li>
          </ol>
        </div>

        {/* Formaya Özel Sunulan Özellikler */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white dark:text-gray-100">
            Formaya Özel Sunulan Özellikler
          </h2>
          <ul className="list-disc list-inside space-y-3 text-lg text-white/95 dark:text-gray-200 pl-4">
            <li><strong className="text-green-300 dark:text-green-400">Farklı Tasarım Modelleri:</strong> Çubuklu, parçalı, düz veya özel desenler arasından takımınıza en uygun olanı seçme özgürlüğü.</li>
            <li><strong className="text-green-300 dark:text-green-400">Sponsor ve İsim Baskıları:</strong> Formanızı takımınıza özel hale getirecek profesyonel eklemelerle markanızı öne çıkarın.</li>
            <li><strong className="text-green-300 dark:text-green-400">Uzun Ömürlü Kalite:</strong> Çevre dostu ve dayanıklı kumaşlarımız sayesinde formalarınız uzun yıllar boyunca performansını korur.</li>
          </ul>
        </div>

        {/* Hızlı Üretim ve Teslimat Süreci */}
        <div className="bg-white/10 dark:bg-gray-700/20 p-8 rounded-lg mb-12 shadow-inner">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white dark:text-gray-100">
            Hızlı Üretim ve Teslimat Süreci
          </h2>
          <p className="text-lg text-white/90 dark:text-gray-200">
            Siparişleri kısa sürede hazırlayan AcunSport, üretim sonrası ürünlerinizi hızlı bir şekilde adresinize teslim eder. Üretim sürecinde kullanılan yüksek kaliteli malzemeler, formaların uzun yıllar dayanmasını garanti eder.
          </p>
        </div>

        {/* Uygun Fiyatlı ve Özelleştirilebilir Forma Seçenekleri */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white dark:text-gray-100">
            Uygun Fiyatlı ve Özelleştirilebilir Forma Seçenekleri
          </h2>
          <p className="text-lg text-white/90 dark:text-gray-200">
            Uygun fiyatlı ve özelleştirilebilir forma seçenekleriyle takım ruhunu yansıtan şık tasarımlar artık çok daha erişilebilir. Hem bütçe dostu fiyatlarla hem de tamamen isteğe göre kişiselleştirilebilen formalar sayesinde, ister halı saha maçları için ister resmi turnuvalar için ideal çözümler sunuyoruz. Numara, isim, logo, sponsor baskısı gibi birçok detayı **ücretsiz** olarak ekleyebilir, dilerseniz tasarım ve renk değişikliğiyle formalarınızı tamamen size özel hale getirebilirsiniz. Kaliteli kumaş yapısıyla terletmeyen ve konforlu bir deneyim sunan formalarımız, her seviyedeki futbol tutkunu için mükemmel bir tercih.
          </p>
        </div>

        {/* AcunSport'un Farkı */}
        <div className="bg-white/10 dark:bg-gray-700/20 p-8 rounded-lg mb-12 shadow-inner">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white dark:text-gray-100">
            AcunSport'un Farkı
          </h2>
          <ul className="list-disc list-inside space-y-3 text-lg text-white/95 dark:text-gray-200 pl-4">
            <li><strong className="text-green-300 dark:text-green-400">Kaliteli Kumaşlar:</strong> Yıpranmaya dayanıklı ve nefes alabilir kumaşlarla oyunculara ekstra rahatlık ve üstün performans sunar.</li>
            <li><strong className="text-green-300 dark:text-green-400">Sürdürülebilir Üretim:</strong> Çevre dostu tekniklerle üretim yaparak hem doğaya hem de geleceğe katkıda bulunuyoruz.</li>
            <li><strong className="text-green-300 dark:text-green-400">Kullanıcı Dostu Sistem:</strong> Forma tasarım süreci, herkesin kolayca sipariş verebileceği şekilde sezgisel ve erişilebilir olarak tasarlanmıştır.</li>
          </ul>
        </div>

        {/* Tasarıma Hemen Başlayın! (Son CTA) */}
        <div className="text-center mt-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white dark:text-gray-100">
            Hayalinizdeki Formaları Tasarlamak İçin Hemen Harekete Geçin!
          </h2>
          <p className="text-lg text-white/90 dark:text-gray-200 mb-8">
            AcunSport, takımınızın ihtiyacını karşılamak için en kaliteli formaları sunar. Şimdi tasarıma başlamak için:
          </p>
        </div>
      </div>
    </section>
  );
};

export default CallToInfo;
