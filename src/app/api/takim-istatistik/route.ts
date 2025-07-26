import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // takim_istatistik tablosundan gerekli verileri çek
    // 70108472 ve 1111111111 ID'li takımları da dahil et
    const takimVerileri = await query(`
      SELECT 
        takim_id,
        takim_adi, 
        blabla_tkm,
        hvatpMb_HT, 
        hvatpkznyzd_HT,
        pnltszxgMb_ag,
        klsndexgMb_ag,
        sutenglMb_svn,
        uzklstrmaMb_svn,
        klsndSutMb_svnetk,
        rkpGlCvrYzd_svnetk,
        ynlGolMb_klclk,
        klsndeSutMb_klclk,
        topMdhDnmMb_topmdh,
        topMdhKznYzd_topmdh,
        svnYprkRkpPas_prs,
        ortSvnHtYksMb_prs,
        rkpDrnTopAsstMb_SvnDTvrm,
        DrnTopRkpOrtMb_SvnDTvrm,
        xaDrnTopMb_hcmDTvrm,
        yplnOrtDtMb_hcmDTvrm,
        sutMb_hcmetkn,
        goleDnsYzd_hcmetkn,
        golMb_glclk,
        pnltszXgMb_glclk,
        isbtlSutMb_sut,
        sutBasınaXg_sut,
        golDt_DtGol,
        ynlGolDt_DtGol,
        pasDnmMb_pas,
        isbtlPasYzd_pas,
        rkpIsbtlPasSys_PasDnmk,
        isbtlPas_PasDnmk,
        rkpUcnBlgPasMb_UcBlgDmns,
        UcnBlgPasMb_UcBlgDmns,
        calimMb_hrktllk,
        topKybiMb_hrktllk,
        topKznMb_TopShp,
        topKybiMb_TopShp,
        ortDnmMb_ort,
        isbtlOrtYzd_ort,
        ynlGolMb_svntkm,
        klsndeXgMb_svntkm,
        golYmdMcSys_svntkm,
        topMdhKznYzd_svntkm,
        svnYprknRkpPas_svntkm,
        topKzn_svntkm,
        rkpUcnBlgPas_svntkm,
        yplnFaulMb_svntkm,
        golMb_hcmtkm,
        pnltszXgMb_hcmtkm,
        sutMb_hcmtkm,
        isbtlSutYzd_hcmtkm,
        calimMb_hcmtkm,
        isbtlOrt_hcmtkm,
        isbtlPasYzd_hcmtkm,
        kznlFaulMb_hcmtkm
      FROM 
        takim_istatistik
      WHERE
        (hvatpMb_HT IS NOT NULL AND hvatpkznyzd_HT IS NOT NULL) OR
        takim_id IN (70108472, 1111111111)
    `);
    
    return NextResponse.json(takimVerileri);
  } catch (error: any) {
    console.error('Takım istatistik verisi çekme hatası:', error);
    return NextResponse.json(
      { error: 'Veri çekme hatası', details: error.message },
      { status: 500 }
    );
  }
} 