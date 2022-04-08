/** Core syntax parsing extensions */
import {
    mystBreakMmarkExt,
    mystBreakMdastExt,
} from '@unified-myst/break-extension'
import {
    mystCommentMmarkExt,
    mystCommentMdastExt,
} from '@unified-myst/comment-extension'
import {
    mystRoleMmarkExt,
    mystRoleMdastExt,
} from '@unified-myst/role-extension'
import {
    mystTargetMmarkExt,
    mystTargetMdastExt,
} from '@unified-myst/target-extension'
import { frontmatter as frontmatterMmarkExt } from 'micromark-extension-frontmatter'
import { frontmatterFromMarkdown as frontmatterMdastExt } from 'mdast-util-frontmatter'
import { gfmTable as gfmTableMmarkExt } from 'micromark-extension-gfm-table'
import { gfmTableFromMarkdown as gfmTableMdastExt } from 'mdast-util-gfm-table'
import { gfmFootnote as gfmFootnoteMmarkExt } from 'micromark-extension-gfm-footnote'
import { gfmFootnoteFromMarkdown as gfmFootnoteMdastExt } from 'mdast-util-gfm-footnote'

/** The core MyST syntax extensions to CommonMark */
export const syntaxMystExtension = {
    name: 'syntaxMyst',
    parsing: [
        {
            name: 'comment',
            tokenizer: mystCommentMmarkExt,
            toMdast: mystCommentMdastExt,
        },
        {
            name: 'role',
            tokenizer: mystRoleMmarkExt,
            toMdast: mystRoleMdastExt,
        },
        {
            name: 'target',
            tokenizer: mystTargetMmarkExt,
            toMdast: mystTargetMdastExt,
        },
        {
            name: 'break',
            tokenizer: mystBreakMmarkExt,
            toMdast: mystBreakMdastExt,
        },
        {
            name: 'frontmatter',
            tokenizer: frontmatterMmarkExt(['yaml']),
            toMdast: frontmatterMdastExt(['yaml']),
        },
        {
            name: 'gfm-table',
            tokenizer: gfmTableMmarkExt,
            toMdast: gfmTableMdastExt,
        },
        {
            name: 'gfm-footnote',
            tokenizer: gfmFootnoteMmarkExt(),
            toMdast: gfmFootnoteMdastExt(),
        },
    ],
}
