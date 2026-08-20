import {IsBoolean,IsIn,IsNotEmpty,IsOptional,IsString} from 'class-validator';
export class AnalyzePatternDto{@IsIn(['source_image','existing_pattern_image']) sourceType!:'source_image'|'existing_pattern_image'}
export class ConvertPatternDto{@IsIn([24,29,40,58,75]) targetWidth!:24|29|40|58|75;@IsIn(['mard-24','mard-48','mard-72','mard-96','mard-120','mard-221']) kitId!:'mard-24'|'mard-48'|'mard-72'|'mard-96'|'mard-120'|'mard-221';@IsOptional()@IsIn(['clean','balanced','detail']) preset?:'clean'|'balanced'|'detail';@IsOptional()@IsBoolean() removeBackground?:boolean;@IsOptional()@IsBoolean() mirror?:boolean}
export class ConfirmPatternDto{@IsString()@IsNotEmpty() name!:string}
