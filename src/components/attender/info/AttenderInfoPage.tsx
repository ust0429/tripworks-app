import React, { useEffect, useState } from 'react';
import { ChevronLeft, MapPin, Clock, Calendar, CreditCard, Users, Sparkles, Zap, MessageCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../AuthComponents';

interface AttenderInfoPageProps {
  onBack?: () => void;
}

const AttenderInfoPage: React.FC<AttenderInfoPageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { isAuthenticated, openLoginModal, user } = useAuth();
  const [buttonText, setButtonText] = useState<string>('ログインして申請する');

  // ログイン状態を確認しボタンテキストを更新
  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, user });
    setButtonText(isAuthenticated ? 'アテンダーに申請する' : 'ログインして申請する');
  }, [isAuthenticated, user]);

  const handleApplyClick = () => {
    console.log('Apply button clicked. isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      // ログイン済みの場合、申請ページに遷移
      navigate('/apply-to-be-attender');
    } else {
      // 未ログインの場合、ログインモーダルを表示
      openLoginModal();
    }
  };

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // アテンダーの特徴リスト
  const features = [
    {
      icon: <MapPin className="w-6 h-6 text-teal-600" />,
      title: '自分の街で活躍',
      description: '自分が愛する地域の魅力を旅行者に伝え、特別な体験を提供できます。'
    },
    {
      icon: <Clock className="w-6 h-6 text-teal-600" />,
      title: '自分のペースで活動',
      description: '自分の都合に合わせてスケジュールを設定。空き時間を有効活用できます。'
    },
    {
      icon: <CreditCard className="w-6 h-6 text-teal-600" />,
      title: '追加収入を得る',
      description: '自分の知識や経験を活かして、観光ガイドとは違う魅力を提供し収益化できます。'
    },
    {
      icon: <Users className="w-6 h-6 text-teal-600" />,
      title: '新しい出会い',
      description: '様々な旅行者との交流を通じて、新しい人間関係を築くことができます。'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-teal-600" />,
      title: '地域の魅力を再発見',
      description: '案内をすることで、自分自身も地域の新たな魅力に気づくきっかけに。'
    },
    {
      icon: <Zap className="w-6 h-6 text-teal-600" />,
      title: 'スキルを磨く',
      description: 'コミュニケーション、企画力、地域の知識など様々なスキルが向上します。'
    }
  ];

  // よくある質問
  const faqs = [
    {
      question: 'アテンダーになるには何が必要ですか？',
      answer: '18歳以上で、地域の魅力や文化についての知識、そして旅行者との交流を楽しめる方なら誰でも応募できます。身分証明書の提出と簡単な審査があります。'
    },
    {
      question: '報酬はどのように決まりますか？',
      answer: 'アテンダー自身が提供する体験の内容や時間に応じて設定できます。echoアプリはサービス利用料として報酬の15%をいただきます。'
    },
    {
      question: '観光ガイドの資格は必要ですか？',
      answer: 'いいえ、必要ありません。echoのアテンダーは従来の観光ガイドとは異なり、地域の生の魅力を伝える「同行者」という位置づけです。'
    },
    {
      question: '一日にどれくらいの時間が必要ですか？',
      answer: '完全に自分のペースで活動できます。週末だけでも、平日の夕方だけでも、あなたの都合に合わせた活動が可能です。'
    },
    {
      question: '旅行者とのトラブルが起きた場合どうなりますか？',
      answer: 'echoアプリのサポートチームが24時間体制でバックアップします。保険の適用もあるので安心して活動いただけます。'
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* ヘッダー */}
      <div className="bg-black text-white p-4">
        <div className="container mx-auto">
          <button 
            onClick={handleGoBack}
            className="flex items-center text-white mb-4"
          >
            <ChevronLeft size={20} />
            <span>戻る</span>
          </button>
          <h1 className="text-3xl font-bold mb-2">アテンダーについて</h1>
          <p className="text-xl">地域の魅力を伝え、旅をもっと特別なものに</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* メインコンテンツ */}
        <div className="max-w-3xl mx-auto space-y-12">
          {/* イントロセクション */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4">echoアテンダーとは</h2>
            <p className="text-gray-700 mb-4">
              echoアテンダーは、従来の観光ガイドとは一線を画す、新しいスタイルの「地域の案内人」です。
              観光名所を巡る定型ツアーではなく、地域に住む人だからこそ知っている魅力や文化を伝え、
              旅行者と共に新たな体験を創り出す役割を担います。
            </p>
            <p className="text-gray-700 mb-4">
              あなたの「好き」や「知っている」を活かし、旅行者に特別な体験を提供できます。
              路地裏のカフェ、地元の音楽シーン、伝統工芸の工房など、ガイドブックには載らない「インディーズな旅」を提案してみませんか？
            </p>
            <div className="mt-6">
              <img 
                src="/images/attender-concept.jpg" 
                alt="アテンダーのコンセプトイメージ" 
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Echo+Attender+Concept';
                }}
              />
            </div>
          </section>

          {/* アテンダーの特徴 */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">アテンダーの魅力</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* アテンダーになるまでの流れ */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">アテンダーになるまでの流れ</h2>
            <div className="space-y-6">
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">基本情報の入力</h3>
                  <p className="text-gray-600">名前、連絡先、活動可能な地域などの基本情報を入力します。</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">専門分野と提供可能な体験の登録</h3>
                  <p className="text-gray-600">あなたの得意分野や提供できる体験内容を登録します。地元の食、アート、歴史などカテゴリー別に登録できます。</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">本人確認</h3>
                  <p className="text-gray-600">安全なコミュニティを維持するため、身分証明書による本人確認を行います。（すべての情報は厳重に管理されます）</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">審査と承認</h3>
                  <p className="text-gray-600">通常3〜5営業日程度で審査が完了します。承認されるとアテンダーとして活動開始できます。</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">活動開始</h3>
                  <p className="text-gray-600">あなたのプロフィールが公開され、旅行者からのリクエストを受け付けられるようになります。</p>
                </div>
              </div>
            </div>
          </section>

          {/* アテンダーの声 */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">アテンダーの声</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-teal-500 pl-4 py-2">
                <p className="italic text-gray-700 mb-2">
                  "自分が住む街の魅力を改めて発見できるようになりました。旅行者の方々の新鮮な驚きや感動に触れることで、日常が特別なものに変わりました。"
                </p>
                <p className="font-medium">鈴木さん（30代・京都在住、1年間活動中）</p>
              </div>
              
              <div className="border-l-4 border-teal-500 pl-4 py-2">
                <p className="italic text-gray-700 mb-2">
                  "平日の仕事終わりや週末の空き時間を活用して活動しています。自分の好きなことで収入を得られるのが最高です。何より様々な国の方との出会いが刺激になっています。"
                </p>
                <p className="font-medium">田中さん（20代・東京在住、6ヶ月間活動中）</p>
              </div>
              
              <div className="border-l-4 border-teal-500 pl-4 py-2">
                <p className="italic text-gray-700 mb-2">
                  "定年退職後の新しい活動として始めました。長年住んだ街の歴史や文化を伝えることで、自分の知識や経験が役立つ喜びを感じています。"
                </p>
                <p className="font-medium">佐藤さん（60代・福岡在住、8ヶ月間活動中）</p>
              </div>
            </div>
          </section>

          {/* よくある質問 */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">よくある質問</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <h3 className="font-bold text-lg mb-2 flex items-start">
                    <span className="text-teal-600 mr-2">Q.</span> 
                    {faq.question}
                  </h3>
                  <p className="text-gray-700 pl-6">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 安心・安全のための取り組み */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4">安心・安全のための取り組み</h2>
            <div className="flex space-x-4 mb-4">
              <Shield className="w-6 h-6 text-teal-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold">利用者の身元確認</h3>
                <p className="text-gray-600">すべてのユーザーは本人確認を完了している安心の環境です。</p>
              </div>
            </div>
            <div className="flex space-x-4 mb-4">
              <MessageCircle className="w-6 h-6 text-teal-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold">24時間サポート</h3>
                <p className="text-gray-600">活動中に困ったことがあれば、いつでもサポートチームにご連絡いただけます。</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <CreditCard className="w-6 h-6 text-teal-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold">補償制度</h3>
                <p className="text-gray-600">万が一のトラブルに備え、各種保険や補償制度を用意しています。</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">あなたも特別な体験を創り出す<br />アテンダーになりませんか？</h2>
            <p className="mb-6">登録は簡単です。まずは申請フォームから始めましょう。</p>
            <button 
              onClick={handleApplyClick}
              className="bg-white text-teal-700 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition duration-200 shadow-md"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttenderInfoPage;