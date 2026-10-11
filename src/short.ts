import { type CritterRenderState } from './critter.ts'

export const emoticon = (state: CritterRenderState) => {
    const baseSet = {
        
            dead: '[RIP]',
            happy: 'ʕ＾ᴥ＾ʔ',
            hungry: 'ʕºᴥºʔ',
            idle: 'ʕ•ᴥ•ʔ',
            refusing: 'ʕˋᴥˊʔ',
            sad: 'ʕ；ᴥ；ʔ',
            sick: 'ʕ×ᴥ×ʔ',
            tired: 'ʕ-ᴥ-ʔ',
            sleeping: 'zZz',
        
    }
    const bears: {
        0: { idle: string }
        1: Record<CritterRenderState['sprite'], string>
        2: Record<CritterRenderState['sprite'], string>
    } = {
        0: { idle: '( . )' },
        1: baseSet,
        2: baseSet,
      
    }
    return state.stage === 0 ? bears[0].idle : bears[state.stage][state.sprite]
}


export const bars = (state: CritterRenderState) => {
    

}
export const short = (state: CritterRenderState) => emoticon(state)