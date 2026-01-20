import { Image } from "@/shared/ui/image/image";

export const AboutWidget = () => {
  return (
    <section className="w-full bg-[#FFFAF6] py-12 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          <div className="w-full hidden md:block lg:w-1/2 flex-shrink-0">
            <div className="w-full h-full">
              <Image
                src="/images/flower.png"
                alt="Букет цветов"
                className="w-full h-full object-cover"
                loading="lazy"
                height={630}
              />
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col gap-6 lg:gap-8 justify-center items-center">
            <h2 className="text-2xl md:text-3xl font-sans font-semibold text-[#FF6600]">
              О нас
            </h2>

            <div className="mb-2">
              <Image
                src="/images/lascovo-black.png"
                alt="LASCOVO Logo"
                width={413}
                height={55}
                loading="lazy"
                className=" max-w-[280px] md:w-auto h-auto md:max-w-full"
              />
            </div>

            <div className="flex-shrink-0 overflow-hidden">
              <Image
                src="/images/flower.png"
                alt="Букет цветов"
                className="w-full h-full object-cover"
                loading="lazy"
                width={196}
                height={196}
              />
            </div>

            <p className="text-base md:text-lg font-sans text-[#181818] leading-relaxed max-w-lg text-center">
              Lascovo — это место, где вы найдете идеальный букет для любого
              повода. Мы создаем композиции, которые дарят незабываемые
              впечатления и радуют ваших близких и друзей.
            </p>

            <div className="flex items-center gap-4 mt-2">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity flex-shrink-0"
                aria-label="Instagram"
              >
                <Image
                  src="/images/instagram.png"
                  alt="Instagram"
                  width={89}
                  height={89}
                  loading="lazy"
                  className="w-10 h-10"
                />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity flex-shrink-0"
                aria-label="Telegram"
              >
                <Image
                  src="/images/telegram.png"
                  alt="Telegram"
                  width={89}
                  height={89}
                  loading="lazy"
                  className="w-10 h-10"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
