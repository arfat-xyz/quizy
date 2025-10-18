import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "@/components/ui/card"; // Adjust path as needed
import { metaDataGeneratorForNormalPage } from "@/lib/generate-meta";
export const metadata = metaDataGeneratorForNormalPage(
  "Dashboard - Arfat",
  "Your Productivity Dashboard on Arfat.",
);
const page = async () => {
  const cardsData = Array(20)
    .fill("arfat")
    .map((value, i) => ({
      id: i,
      title: `Card Title ${i + 1}`,
      description: `This is a beautiful card description for card number ${i + 1}.`,
      content: value,
      actionText: `Action ${i + 1}`,
    }));

  return (
    <div className="container mx-auto grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cardsData.map(card => (
        <Card
          key={card.id}
          className="transition-shadow duration-300 hover:shadow-lg"
        >
          <CardHeader>
            <CardTitle className="text-lg">{card.title}</CardTitle>
            <CardDescription>{card.description}</CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <div className="bg-primary/10 mb-4 flex size-20 items-center justify-center rounded-xl">
              <span className="text-primary font-medium">{card.content}</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Additional content or details can go here. This card demonstrates
              the flexibility of the card component system.
            </p>
          </CardContent>

          <CardFooter className="border-t pt-6">
            <CardAction>
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                {card.actionText}
              </button>
            </CardAction>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default page;
