import { Card } from "@/components/ui/card";

export default function ConversationPreview() {
  return (
    <Card className="bg-discord-darkbg rounded-lg p-5 shadow">
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {/* User Question */}
        <div className="flex items-start">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-discord-blue/20 flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-discord-blue"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div>
            <div className="font-medium mb-1">User#5678</div>
            <div className="bg-discord-bg rounded-lg px-4 py-2 max-w-lg">
              !ask Who was the founder of the Ahmadiyya Muslim Community?
            </div>
          </div>
        </div>
        
        {/* Bot Response */}
        <div className="flex items-start">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-discord-green/20 flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-discord-green"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
          </div>
          <div className="flex-1">
            <div className="font-medium mb-1">Ahmadiyya Helper</div>
            <div className="border-l-4 border-discord-green bg-discord-bg rounded-lg p-1 max-w-lg">
              <div className="px-3 py-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-discord-green mr-2 flex-shrink-0"></div>
                  <div className="font-medium">Founder of Ahmadiyya Muslim Community</div>
                </div>
                <div className="mt-2 text-discord-lightgray">
                  The Ahmadiyya Muslim Community was founded by Mirza Ghulam Ahmad (1835-1908) in 1889 in Qadian, India. He claimed to be the promised Messiah and Mahdi awaited by Muslims, as well as the metaphorical second coming of Jesus Christ awaited by Christians and the manifestation of Krishna for Hindus.
                </div>
                <div className="mt-2 text-xs text-discord-lightgray border-t border-discord-darkest pt-2">
                  Source: "Invitation to Ahmadiyyat" by Mirza Bashir-ud-Din Mahmud Ahmad, p.15-17
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* User Question */}
        <div className="flex items-start">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-discord-blue/20 flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-discord-blue"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div>
            <div className="font-medium mb-1">User#5678</div>
            <div className="bg-discord-bg rounded-lg px-4 py-2 max-w-lg">
              !beliefs khilafat
            </div>
          </div>
        </div>
        
        {/* Bot Response */}
        <div className="flex items-start">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-discord-green/20 flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-discord-green"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
          </div>
          <div className="flex-1">
            <div className="font-medium mb-1">Ahmadiyya Helper</div>
            <div className="border-l-4 border-discord-green bg-discord-bg rounded-lg p-1 max-w-lg">
              <div className="px-3 py-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-discord-green mr-2 flex-shrink-0"></div>
                  <div className="font-medium">Ahmadiyya Belief: Khilafat</div>
                </div>
                <div className="mt-2 text-discord-lightgray">
                  In Ahmadiyya Islam, Khilafat refers to the spiritual institution of successorship that began after the death of Mirza Ghulam Ahmad in 1908. The Khalifa (successor) is believed to be divinely guided and serves as the spiritual and administrative head of the community. The community follows a system of elected Khilafat, where the successor is chosen by an electoral college. Currently, the fifth Khalifa, Mirza Masroor Ahmad, leads the community since 2003.
                </div>
                <div className="mt-2 text-xs text-discord-lightgray border-t border-discord-darkest pt-2">
                  Source: "The Institution of Khilafat" published by The Review of Religions, 2008
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
