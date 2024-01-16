'use client';

import jsPDF from 'jspdf';
import { domToCanvas } from 'modern-screenshot';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useRecoilValue } from 'recoil';
import { Button } from '@/shared/components/common/Button';
import { Flex, Stack } from '@/shared/components/common/Layout';
import { Modal } from '@/shared/components/common/Modal';
import { BusinessCard } from '@/shared/components/features';
import { recoilScaleState } from '@/shared/components/features/BusinessCard/atom';
import {
  IconBallpen,
  IconDownload,
  IconPhotoSearch,
} from '@/shared/components/icons';
import { ROUTES } from '@/shared/constants';
import { useGetBusinessCard } from '@/shared/hooks/restapi/v1/BusinessCard';
import { useDisclosure } from '@/shared/lib/mantine';
import { useLoading } from '@/shared/providers/loading';

export const CardPage = () => {
  const params = useParams<{ card_id: string }>();
  const [opened, { open, close }] = useDisclosure();
  const router = useRouter();
  const { data, error, isLoading } = useGetBusinessCard(params.card_id);
  const { open: openLoading, close: closeLoading } = useLoading();
  const recoilScale = useRecoilValue(recoilScaleState);

  const exportPDF = async () => {
    const element = document.getElementById(`business_card`);
    if (!element) return;

    const canvas = await domToCanvas(element, {});
    const imageData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');

    // 名刺のサイズ
    const cardWidth = 91 * (1 / recoilScale);
    const cardHeight = 55 * (1 / recoilScale);

    // A4サイズの寸法
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 5;

    // A4用紙に収まる名刺の数を計算
    const cardsPerRow = Math.floor(pageWidth / cardWidth);
    const cardsPerColumn = Math.floor(pageHeight / cardHeight);

    // A4用紙に名刺を配置
    for (let row = 0; row < cardsPerColumn; row++) {
      for (let col = 0; col < cardsPerRow; col++) {
        const x = col * cardWidth + margin;
        const y = row * cardHeight + margin;
        pdf.addImage(imageData, 'PNG', x, y, cardWidth, cardHeight);
      }
    }

    pdf.save(`${data?.displayName}.pdf`);
  };

  const handleOnClickEdit = () => {
    if (!data) {
      console.error(data);
      return;
    }
    router.push(`${ROUTES.cards.edit(data.id)}`);
  };
  if (error) return <div>failed to load</div>;
  if (isLoading) openLoading();
  closeLoading();

  if (!data) return null;
  return (
    <>
      <Stack align="center">
        <BusinessCard card={data} id="business_card" />
        <Button
          onClick={open}
          leftSection={<IconPhotoSearch />}
          fullWidth
          variant="light"
        >
          拡大表示
        </Button>
        <Button
          leftSection={<IconBallpen />}
          fullWidth
          variant="outline"
          onClick={handleOnClickEdit}
        >
          名刺を編集する
        </Button>
        <Button leftSection={<IconDownload />} onClick={exportPDF} fullWidth>
          名刺をダウンロード
        </Button>
      </Stack>
      <Modal opened={opened} onClose={close} fullScreen>
        <Flex h="100%">
          <BusinessCard
            card={data}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(90deg) scale(${1.25})`,
            }}
          />
        </Flex>
      </Modal>
    </>
  );
};
