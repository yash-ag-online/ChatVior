import Chat from "@/components/chat";
import Header from "@/components/header";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Chat id={id} />
    </div>
  );
};

export default Page;
