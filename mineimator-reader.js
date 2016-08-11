const readMineimator = function(input) {
    return new Promise(function(resolve, reject) {
        if (input.constructor.name != "ArrayBuffer" && input.constructor.name != "Buffer") {
            reject(new Error("Data must be an ArrayBuffer"))
        } else {
            
            if (input.constructor.name == "Buffer") {
                var env = "node"
            } else {
                var env = "browser"
            }
            let current = 0;
            let data = new DataView(input)
            let loop = []
            let loopIndex = -1;
            let save = {};
            let bufferRead = function(object) {
                
                this.checks = function(val, num) {
                    if (object.save) {
                        save[object.name] = val
                    }
                    
                    if (object.version == false) {
                        current -= num
                        return undefined
                    } else {
                        return val
                    }
                }
                
                switch(object.type) {
                    case "byte":
                        {
                            let returnObj = {};
                            let value = env == "browser" ? data.getInt8(current) : data[current]
                            current++
                            returnObj[object.name] = this.checks(value, 1)
                            
                            return returnObj
                            
                        }
                        
                    case "string": 
                        {
                            let returnObj = {}
                            let length =  env == "browser" ? data.getInt32(current, true) : data.readInt32LE(current)
                            current += 4;
                            let charBytes = new Int8Array(length);
                            for (let x = 0; x < length; x++) {
                                charBytes[x] = env == "browser" ? data.getInt8(current + x) : data[(current + x)]
                            }
                            let value = "";
                            current += length;
                            charBytes.map(charByte => value += String.fromCharCode(charByte))
                            returnObj[object.name] = this.checks(value, (4 + length))
                            
                            return returnObj
                        }
                        
                        
                    case "int":
                    case "iid":    
                        {
                            let returnObj = {};
                            let value = env == "browser" ? data.getInt32(current, true) : data.readInt32LE(current);
                            current += 4
                            returnObj[object.name] = this.checks(value, 4)
                            return returnObj
                        }
                    case "double":
                        {
                            let returnObj = {};
                            let value = env == "browser" ? data.getFloat64(current) : data.readDoubleLE(current)
                            current += 8
                            returnObj[object.name] = this.checks(value, 8)
                            return returnObj;
                        }
                    case "short":
                        {
                            let returnObj = {};
                            let value = env == "browser" ? data.getInt16(current) : data.readInt16LE(current)
                            current += 2;
                            returnObj[object.name] = this.checks(value, 2);
                            return returnObj;
                        }
                    case "loop":
                        {
                            loopIndex++
                            loop[loopIndex] = {};
                            let amount = bufferRead(object.options)
                            loop[loopIndex].amount = amount[object.options.name]
                           
                            
                            loop[loopIndex].content = [];
                            for (let x = 0; x < loop[loopIndex].amount; x++) {
                                loop[loopIndex].placeholder = {};
                                object.iterate.map(obj => Object.assign(loop[loopIndex].placeholder, bufferRead(obj)))
                                loop[loopIndex].content.push(loop[loopIndex].placeholder)
                            }
                            let returnObj = {}
                            returnObj[object.name] = this.checks(loop[loopIndex].content)
                            loopIndex--
                            return returnObj;
                        }
                        
                    case "onlyIf":
                        {
                            let onlyIfObj = {};
                            if (object.onlyIf) {
                                object.iterate.map(obj => Object.assign(onlyIfObj, bufferRead(obj)))
                            } else if (object.key && object.equals) {
                                if (save[object.key] == object.equals) {
                                    object.iterate.map(obj => Object.assign(onlyIfObj, bufferRead(obj)))
                                }
                            } else {
                                break;
                            }
                        }
                        break;
                        
                    case "const":
                        {
                            let returnObj = {}
                            returnObj[object.name] = object.num
                            return returnObj
                        }
                        
                        
                        
                        
                        
                }
                
            }
            
            let bufferOrder = function() {
                let obj = {};
                for (let key in arguments) {
                    Object.assign(obj, bufferRead(arguments[key]))
                }
                return obj
            }
            
            let load_format = bufferRead({type:"byte", name:"version"}).version
            
            
            let format_01 = 1;
            let format_02 = 2;
            let format_05 = 3;
            let format_06 = 4;
            let format_07demo = 5;
            let format_100demo2 = 6
            let format_100demo3 = 7;
            let format_100demo4 = 8;
            let format_100debug = 9;
            let format_100 = 10;
            let format_105 = 11;
            let format_105_2 = 12;
            let format_106 = 13;
            
            resolve(bufferOrder( { type: "string", name: "project_name" },
                                { type: "string", name: "project_author" },
                                { type: "string", name: "project_description" },
                                { type: "byte", name: "project_video_template", version: (load_format<format_100debug)},
                                { type: "int", name: "project_video_width" },
                                { type: "int", name: "project_video_height" },
                                { type: "byte", name: "project_video_keep_aspect_ratio"},
                                { type: "byte", name: "project_tempo"}, 
                                { type: "byte", name: "timeline_repeat", version: (load_format>=format_100)},
                                { type: "double", name: "timeline_marker", version: (load_format>=format_105_2)},
                                { type: "double", name: "timeline.hor_scroll", version: (load_format>=format_100demo4)},
                                { type: "double", name: "timeline_zoom", version: (load_format>=format_100demo4)},
                                { type: "int", name: "timeline_region_start", version: (load_format>=format_100debug) }, 
                                { type: "int", name: "timeline_region_end", version: (load_format>=format_100debug) },
                                { type: "loop", name: "templates", options: { type: "int" }, iterate: [
                                    { type: "iid", name: "iid" },
                                    { type: "string", name: "type", save: true },
                                    { type: "string", name: "name" }, 
                                    { type: "int", name: "count", version: (load_format == format_100demo2)},
                                    { type: "iid", name: "char_skin" },
                                    { type: "string", name: "char_model", version: (load_format >= format_100debug) },
                                    { type: "char", name: "char_model_old", version: (load_format < format_100debug)},
                                    { type: "int", name: "char_body_part" },
                                    { type: "iid", name: "item_tex" },
                                    { type: "byte", name: "item_sheet", version: (load_format >= format_100debug) },
                                    { type: "int", name: "item_n" },
                                    { type: "byte", name: "item_3d" },
                                    { type: "byte", name: "item_face_camera" },
                                    { type: "byte", name: "item_bounce" },
                                    { type: "short", name: "block_id" },
                                    { type: "byte", name: "block_data" },
                                    { type: "iid", name: "block_tex" },
                                    { type: "iid", name: "scenery" },
                                    { type: "byte", name: "repeat_toggle" },
                                    { type: "int", name: "repeat_x" },
                                    { type: "int", name: "repeat_y" },
                                    { type: "int", name: "repeat_z" },
                                    { type: "iid", name: "shape_tex" },
                                    { type: "byte", name: "shape_tex_mapped", version: (load_format >= format_100debug) },
                                    { type: "double", name: "shape_tex_hoffset", version: (load_format >= format_100debug) },
                                    { type: "double", name: "shape_tex_voffset", version: (load_format >= format_100debug) },
                                    { type: "double", name: "shape_tex_hrepeat" },
                                    { type: "double", name: "shape_tex_vrepeat" },
                                    { type: "byte", name: "shape_tex_hmirror" },
                                    { type: "byte", name: "shape_tex_vmirror" },
                                    { type: "byte", name: "shape_closed", version: (load_format >= format_100debug) },
                                    { type: "byte", name: "shape_invert" },
                                    { type: "int", name: "shape_detail" },
                                    { type: "byte", name: "shape_face_camera", version: (load_format >= format_100debug) },
                                    { type: "iid", name: "text_font" },
                                    { type: "string", name: "system_font", version: (load_format < format_100demo4)},
                                    { type: "byte", name: "system_font_bold", version: (load_format < format_100demo4)},
                                    { type: "byte", name: "system_font_italic", version: (load_format < format_100demo4)},
                                    { type: "byte", name: "text_face_camera" },
                                    { type: "onlyIf", name: "PARTICLES_READ", key: "type", equals: "particles", iterate: [
                                        { type: "byte", name: "pc_spawn_constant" },
                                        { type: "int", name: "pc_spawn_amount" },
                                        { type: "byte", name: "pc_region_use" },
                                        { type: "string", name: "pc_spawn_region_type" },
                                        { type: "double", name: "pc_spawn_region_sphere_radius" },
                                        { type: "double", name: "pc_spawn_region_cube_size" },
                                        { type: "double", name: "pc_spawn_region_box_size_xpos" },
                                        { type: "double", name: "pc_spawn_region_box_size_ypos" },
                                        { type: "double", name: "pc_spawn_region_box_size_zpos" },
                                        { type: "byte", name: "pc_bounding_box_type" },
                                        { type: "double", name: "pc_bounding_box_ground_z", version: (load_format >= format_100demo4) },
                                        { type: "double", name: "pc_bounding_box_custom_start_xpos" },
                                        { type: "double", name: "pc_bounding_box_custom_start_ypos" },
                                        { type: "double", name: "pc_bounding_box_custom_start_zpos" },
                                        { type: "double", name: "pc_bounding_box_custom_end_xpos" },
                                        { type: "double", name: "pc_bounding_box_custom_end_ypos" },
                                        { type: "double", name: "pc_bounding_box_custom_end_zpos" },
                                        { type: "byte", name: "pc_bounding_box_relative" },
                                        { type: "byte", name: "pc_destroy_at_animation_finish" },
                                        { type: "byte", name: "pc_destroy_at_amount" },
                                        { type: "int", name: "pc_destroy_at_amount_val" },
                                        { type: "byte", name: "pc_destroy_at_time" },
                                        { type: "double", name: "pc_destroy_at_time_seconds" },
                                        { type: "byte", name: "pc_destroy_at_time_israndom" },
                                        { type: "double", name: "pc_destroy_at_time_random_min" },
                                        { type: "double", name: "pc_destroy_at_time_random_max" },
                                        { type: "loop", name: "particle_types", options: { type: "int" }, iterate: [
                                            { type: "iid", name: "iid", version: (load_format >= format_100debug) },
                                            { type: "string", name: "name" },
                                            { type: "iid", name: "temp" },
                                            { type: "string", name: "text" },
                                            { type: "double", name: "spawn_rate", version: (load_format >= format_100demo3)},
                                            { type: "iid", name: "sprite_tex" },
                                            { type: "byte", name: "sprite_tex_image" },
                                            { type: "int", name: "sprite_frame_width" },
                                            { type: "int", name: "sprite_frame_height" },
                                            { type: "int", name: "sprite_frame_start" },
                                            { type: "int", name: "sprite_frame_end" },
                                            { type: "double", name: "sprite_animation_speed" },
                                            { type: "byte", name: "sprite_animation_speed_israndom" },
                                            { type: "double", name: "sprite_animation_speed_random_min" },
                                            { type: "double", name: "sprite_animation_speed_random_max" },
                                            { type: "byte", name: "sprite_animation_onend" },
                                            { type: "byte", name: "rot_extend" },
                                            { type: "byte", name: "spd_extend" },
                                            { type: "byte", name: "rot_spd_extend" },
                                            { type: "loop", name: "SPD_ROT_DATA", options: { type: "const", num: 3 }, iterate: [
                                                    { type: "double", name: "spd" },
                                                    { type: "byte", name: "spd_israndom" },
                                                    { type: "double", name: "spd_random_min" },
                                                    { type: "double", name: "spd_random_max" },
                                                    { type: "double", name: "spd_add" },
                                                    { type: "byte", name: "spd_add_israndom" },
                                                    { type: "double", name: "spd_add_random_min" },
                                                    { type: "double", name: "spd_add_random_max" },
                                                    { type: "double", name: "spd_mul" },
                                                    { type: "byte", name: "spd_mul_israndom" },
                                                    { type: "double", name: "spd_mul_random_min" },
                                                    { type: "double", name: "spd_mul_random_max" },
                                                    
                                                    { type: "double", name: "rot" },
                                                    { type: "byte", name: "rot_israndom" },
                                                    { type: "double", name: "rot_random_min" },
                                                    { type: "double", name: "rot_random_max" },
                                                    { type: "double", name: "rot_spd" },
                                                    { type: "byte", name: "rot_spd_israndom" },
                                                    { type: "double", name: "rot_spd_random_min" },
                                                    { type: "double", name: "rot_spd_random_max" },
                                                    { type: "double", name: "rot_spd_add" },
                                                    { type: "byte", name: "rot_spd_add_israndom" },
                                                    { type: "double", name: "rot_spd_add_random_min" },
                                                    { type: "double", name: "rot_spd_add_random_max" },
                                                    { type: "double", name: "rot_spd_mul" },
                                                    { type: "byte", name: "rot_spd_mul_israndom" },
                                                    { type: "double", name: "rot_spd_mul_random_min" },
                                                    { type: "double", name: "rot_spd_mul_random_max" },
                                                    
                                                ]},
                                                
                                                { type: "double", name: "scale" },
                                                { type: "byte", name: "scale_israndom" },
                                                { type: "double", name: "scale_random_min" },
                                                { type: "double", name: "scale_random_max" },
                                                { type: "double", name: "scale_add" },
                                                { type: "byte", name: "scale_add_israndom" },
                                                { type: "double", name: "scale_add_random_min" },
                                                { type: "double", name: "scale_add_random_max" },
                                                { type: "double", name: "alpha" },
                                                { type: "byte", name: "alpha_israndom" },
                                                { type: "double", name: "alpha_random_min" },
                                                { type: "double", name: "alpha_random_max" },
                                                { type: "double", name: "alpha_add" },
                                                { type: "byte", name: "alpha_add_israndom" },
                                                { type: "double", name: "alpha_add_random_min" },
                                                { type: "double", name: "alpha_add_random_max" },
                                                { type: "int", name: "color" },
                                                { type: "byte", name: "color_israndom" },
                                                { type: "int", name: "color_random_start" },
                                                { type: "int", name: "color_random_end" },
                                                { type: "byte", name: "color_mix_enabled" },
                                                { type: "int", name: "color_mix" },
                                                { type: "byte", name: "color_mix_israndom" },
                                                { type: "int", name: "color_mix_random_start" },
                                                { type: "int", name: "color_mix_random_end" },
                                                { type: "double", name: "color_mix_time" },
                                                { type: "byte", name: "color_mix_time_israndom" },
                                                { type: "double", name: "color_mix_time_random_min" },
                                                { type: "double", name: "color_mix_time_random_max" },
                                                { type: "byte", name: "spawn_region", version: (load_format >= format_100demo3)},
                                                { type: "byte", name: "bounding_box" },
                                                { type: "byte", name: "bounce" },
                                                { type: "double", name: "bounce_factor" },
                                                { type: "byte", name: "orbit" },
                                                
                                            ]},
                                        
                                        ]},
                                    
                                    ]},
                                    
                                { type: "loop", name: "timelines", options: { type: "int" }, iterate: [
                                    { type: "iid", name: "iid"},
                                    { type: "string", name: "type" },
                                    { type: "string", name: "name" },
                                    { type: "iid", name: "temp" },
                                    { type: "string", name: "text" },
                                    { type: "int", name: "color" },
                                    { type: "byte", name: "lock" },
                                    { type: "int", name: "depth" },
                                    { type: "short", name: "bodypart" },
                                    { type: "iid", name: "part_of" },
                                    { type: "loop", name: "part_amount", options: {type: "short", name:"part_amount_num"}, iterate: [
                                        { type: "iid", name: "part" }
                                        ]},
                                        
                                    { type: "byte", name: "hide" },
                                    { type: "byte", name: "POSITION", save: true },
                                    { type: "byte", name: "ROTATION", save: true },
                                    { type: "byte", name: "SCALE", save: true },
                                    { type: "byte", name: "BEND", save: true },
                                    { type: "byte", name: "COLOR", save: true },
                                    { type: "byte", name: "PARTICLES", save: true },
                                    { type: "byte", name: "LIGHT", save: true },
                                    { type: "byte", name: "SPOTLIGHT", save: true },
                                    { type: "byte", name: "CAMERA", save: true },
                                    { type: "byte", name: "BACKGROUND", save: true },
                                    { type: "byte", name: "TEXTURE", save: true },
                                    { type: "byte", name: "SOUND", save: true },
                                    { type: "byte", name: "KEYFRAME", save: true },
                                    { type: "byte", name: "ROTPOINT", save: true },
                                    { type: "byte", name: "HIERARCHY", save: true },
                                    { type: "byte", name: "GRAPHICS", save: true },
                                    { type: "byte", name: "AUDIO", save: true },
                                    { type: "onlyIf", name: "POSITION_DATA", key: "POSITION", equals: 1, iterate: [
                                        { type: "double", name: "XPOS" },
                                        { type: "double", name: "YPOS" },
                                        { type: "double", name: "ZPOS" },
                                        ]},
                                    { type: "onlyIf", name: "ROTATION_DATA", key: "ROTATION", equals: 1, iterate: [
                                            { type: "double", name: "XROT" },
                                            { type: "double", name: "YROT" },
                                            { type: "double", name: "ZROT" }
                                        ]},
                                        { type: "onlyIf", name: "SCALE_DATA", key: "SCALE", equals: 1, iterate: [
                                        { type: "double", name: "XSCA" },
                                        { type: "double", name: "YSCA" },
                                        { type: "double", name: "ZSCA" },
                                        ]},
                                        
                                    { type: "onlyIf", name: "BEND_DATA", key: "BEND", equals: 1, iterate: [
                                        { type: "double", name: "BENDANGLE" },
                                        ]},
                                    
                                    { type: "onlyIf", name: "COLOR_DATA",  key: "COLOR", equals: 1, iterate: [
                                        { type: "double", name: "ALPHA" },
                                        { type: "int", name: "RGBADD" },
                                        { type: "int", name: "RGBSUB" },
                                        { type: "int", name: "RGBMUL" },
                                        { type: "int", name: "HSBADD" },
                                        { type: "int", name: "HSBSUB" },
                                        { type: "int", name: "HSBMUL" },
                                        { type: "int", name: "MIXCOLOR" },
                                        { type: "double", name: "MIXPERCENT" },
                                        { type: "double", name: "BRIGHTNESS" },
                                    ]},   
                                        
                                    { type: "onlyIf", name: "PARTICLES_DATA",  key: "PARTICLES", equals: 1, iterate: [
                                        { type: "byte", name: "SPAWN" },
                                        { type: "iid", name: "ATTRACTOR" },
                                        { type: "double", name: "FORCE" },
                                    ]},    
                                        
                                    { type: "onlyIf", name: "LIGHT_DATA",  key: "LIGHT", equals: 1, iterate: [
                                        { type: "int", name: "LIGHTCOLOR" },
                                        { type: "double", name: "LIGHTRANGE" },
                                        { type: "double", name: "LIGHTFADESIZE" },
                                        
                                        ]},    
                                        
                                    { type: "onlyIf", name: "SPOTLIGHT_DATA", key: "SPOTLIGHT", equals: 1, iterate: [
                                        { type: "double", name: "LIGHTSPOTRADIUS" },
                                        { type: "double", name: "LIGHTSPOTSHARPNESS" },
                                        ]},    
                                        
                                    { type: "onlyIf", name: "CAMERA_DATA",  key: "CAMERA", equals: 1, iterate: [
                                        { type: "double", name: "CAMFOV" },
                                        { type: "double", name: "CAMRATIO" },
                                        { type: "byte", name: "CAMROTATE" },
                                        { type: "double", name: "CAMROTATEDISTANCE" },
                                        { type: "double", name: "CAMROTATEXYANGLE" },
                                        { type: "double", name: "CAMROTATEZANGLE" },
                                        { type: "byte", name: "CAMDOF" },
                                        { type: "double", name: "CAMDOFDEPTH" },
                                        { type: "double", name: "CAMDOFRANGE" },
                                        { type: "double", name:"CAMDOFFADESIZE" },
                                        ]},  
                                        
                                    { type: "onlyIf", name: "BACKGROUND_DATA",  key: "BACKGROUND", equals: 1, iterate: [
                                        { type: "byte", name: "BGSKYMOONPHASE" },
                                        { type: "double", name: "BGSKYTIME" },
                                        { type: "double", name: "BGSKYROTATION" },
                                        { type: "double", name: "BGSKYCLOUDSSPEED" },
                                        { type: "int", name: "BGSKYCOLOR" },
                                        { type: "int", name: "BGSKYCLOUDSCOLOR" },
                                        { type: "int", name: "BGSUNLIGHTCOLOR" },
                                        { type: "int", name: "BGAMBIENTCOLOR" },
                                        { type: "int", name: "BGNIGHTCOLOR" },
                                        { type: "int", name: "BGFOGCOLOR" },
                                        { type: "double", name: "BGFOGDISTANCE" },
                                        { type: "double", name: "BGFOGSIZE" },
                                        { type: "double", name: "BGFOGHEIGHT" },
                                        { type: "double", name: "BGWINDSPEED" },
                                        { type: "double", name: "BGWINDSTRENGTH" },
                                        { type: "double", name: "BGTEXTUREANISPEED" },
                                        
                                        ]},    
                                        
                                    { type: "onlyIf", name: "TEXTURE_DATA", key: "TEXTURE", equals: 1, iterate: [
                                        { type: "iid", name: "TEXTUREOBJ" },
                                        ]},  
                                        
                                    { type: "onlyIf", name: "SOUND_DATA", key: "SOUND", equals: 1, iterate: [
                                        { type: "iid", name: "SOUNDOBJ" },
                                        { type: "double", name: "SOUNDVOLUME" },
                                        { type: "double", name: "SOUNDSTART" },
                                        { type: "double", name: "SOUNDEND" }
                                        ]},  
                                        
                                    { type: "byte", name: "VISIBLE" },
                                    { type: "int", name: "TRANSITION" },
                                   
                                    
                                    { type: "loop", name: "keyframes", options: {type: "int", name: "keyframe_amount"}, iterate: [
                                        { type: "int", name: "pos"},
                                        { type: "onlyIf", name: "POSITION_DATA", key: "POSITION", equals: 1, iterate: [
                                            { type: "double", name: "XPOS"},
                                            { type: "double", name: "YPOS"},
                                            { type: "double", name: "ZPOS"},
                                        ]},
                                            
                                        
                                    { type: "onlyIf", name: "ROTATION_DATA", key: "ROTATION", equals: 1, iterate: [
                                            { type: "double", name: "XROT"},
                                            { type: "double", name: "YROT"},
                                            { type: "double", name: "ZROT"}
                                        ]},
                                        
                                        
                                    { type: "onlyIf", name: "SCALE_DATA", key: "SCALE", equals: 1, iterate: [
                                        { type: "double", name: "XSCA"},
                                        { type: "double", name: "YSCA"},
                                        { type: "double", name: "ZSCA"},
                                        ]},
                                        
                                    { type: "onlyIf", name: "BEND_DATA", key: "BEND", equals: 1, iterate: [
                                        { type: "double", name: "BENDANGLE"},
                                    ]},
                                    
                                    { type: "onlyIf", name: "COLOR_DATA",  key: "COLOR", equals: 1, iterate: [
                                        { type: "double", name: "ALPHA"},
                                        { type: "int", name: "RGBADD"},
                                        { type: "int", name: "RGBSUB"},
                                        { type: "int", name: "RGBMUL"},
                                        { type: "int", name: "HSBADD"},
                                        { type: "int", name: "HSBSUB" },
                                        { type: "int", name: "HSBMUL" },
                                        { type: "int", name: "MIXCOLOR" },
                                        { type: "double", name: "MIXPERCENT" },
                                        { type: "double", name: "BRIGHTNESS" },
                                    ]},
                                    
                                    { type: "onlyIf", name: "PARTICLES_DATA",  key: "PARTICLES", equals: 1, iterate: [
                                        { type: "byte", name: "SPAWN" },
                                        { type: "iid", name: "ATTRACTOR" },
                                        { type: "double", name: "FORCE" },
                                    ]}, 
                                    
                                    
                                    { type: "onlyIf", name: "LIGHT_DATA",  key: "LIGHT", equals: 1, iterate: [
                                        { type: "int", name: "LIGHTCOLOR" },
                                        { type: "double", name: "LIGHTRANGE" },
                                        { type: "double", name: "LIGHTFADESIZE" },
                                        
                                        ]},    
                                        
                                    { type: "onlyIf", name: "SPOTLIGHT_DATA", key: "SPOTLIGHT", equals: 1, iterate: [
                                        { type: "double", name: "LIGHTSPOTRADIUS" },
                                        { type: "double", name: "LIGHTSPOTSHARPNESS" },
                                        ]},    
                                        
                                    { type: "onlyIf", name: "CAMERA_DATA",  key: "CAMERA", equals: 1, iterate: [
                                        { type: "double", name: "CAMFOV" },
                                        { type: "double", name: "CAMRATIO" },
                                        { type: "byte", name: "CAMROTATE" },
                                        { type: "double", name: "CAMROTATEDISTANCE" },
                                        { type: "double", name: "CAMROTATEXYANGLE" },
                                        { type: "double", name: "CAMROTATEZANGLE" },
                                        { type: "byte", name: "CAMDOF" },
                                        { type: "double", name: "CAMDOFDEPTH" },
                                        { type: "double", name: "CAMDOFRANGE" },
                                        { type: "double", name:"CAMDOFFADESIZE" },
                                        ]},  
                                        
                                    { type: "onlyIf", name: "BACKGROUND_DATA",  key: "BACKGROUND", equals: 1, iterate: [
                                        { type: "byte", name: "BGSKYMOONPHASE" },
                                        { type: "double", name: "BGSKYTIME" },
                                        { type: "double", name: "BGSKYROTATION" },
                                        { type: "double", name: "BGSKYCLOUDSSPEED" },
                                        { type: "int", name: "BGSKYCOLOR" },
                                        { type: "int", name: "BGSKYCLOUDSCOLOR" },
                                        { type: "int", name: "BGSUNLIGHTCOLOR" },
                                        { type: "int", name: "BGAMBIENTCOLOR" },
                                        { type: "int", name: "BGNIGHTCOLOR" },
                                        { type: "int", name: "BGFOGCOLOR" },
                                        { type: "double", name: "BGFOGDISTANCE" },
                                        { type: "double", name: "BGFOGSIZE" },
                                        { type: "double", name: "BGFOGHEIGHT" },
                                        { type: "double", name: "BGWINDSPEED" },
                                        { type: "double", name: "BGWINDSTRENGTH" },
                                        { type: "double", name: "BGTEXTUREANISPEED" },
                                        
                                        ]},    
                                        
                                    { type: "onlyIf", name: "TEXTURE_DATA", key: "TEXTURE", equals: 1, iterate: [
                                        { type: "iid", name: "TEXTUREOBJ" },
                                        ]},  
                                        
                                    { type: "onlyIf", name: "SOUND_DATA", key: "SOUND", equals: 1, iterate: [
                                        { type: "iid", name: "SOUNDOBJ" },
                                        { type: "double", name: "SOUNDVOLUME" },
                                        { type: "double", name: "SOUNDSTART" },
                                        { type: "double", name: "SOUNDEND" }
                                        ]},    
                                        
                                        
                                    { type: "byte", name: "VISIBLE" },
                                    { type: "int", name: "TRANSITION" },    
                                        
                                        
                                    ]},
                                    
                                    
                                    { type: "iid", name: "parent" },
                                    { type: "int", name: "parent_pos" },
                                    { type: "byte", name: "lock_bend" },
                                    { type: "byte", name: "tree_extend" },
                                    { type: "byte", name: "inherit_position" },
                                    { type: "byte", name: "inherit_rotation" },
                                    { type: "byte", name: "inherit_scale" },
                                    { type: "byte", name: "inherit_alpha" },
                                    { type: "byte", name: "inherit_color" },
                                    { type: "byte", name: "inherit_texture" },
                                    { type: "byte", name: "inherit_visibility" },
                                    { type: "byte", name: "scale_resize" },
                                    { type: "byte", name: "rot_point_custom" },
                                    { type: "double", name: "rot_point_XPOS" },
                                    { type: "double", name: "rot_point_YPOS" },
                                    { type: "double", name: "rot_point_ZPOS" },
                                    { type: "byte", name: "backfaces" },
                                    { type: "byte", name: "texture_blur" },
                                    { type: "byte", name: "texture_filtering" },
                                    { type: "byte", name: "round_bending" },
                                    { type: "byte", name: "shadows" },
                                    { type: "byte", name: "ssao" },
                                    { type: "byte", name: "fog", version: (load_format >= format_105_2)},
                                    { type: "byte", name: "wind" },
                                    { type: "double", name: "wind_amount" },
                                    { type: "byte", name: "wind_terrain" },
                                    
                                    
                                    
                                    ]},
                                    
                                { type: "loop", name: "resources", options: {type: "int"}, iterate: [
                                        { type: "iid", name: "iid" },
                                        { type: "string", name: "type", save: true },
                                        { type: "string", name: "filename" },
                                        { type: "byte", name: "is_skin" },
                                        { type: "string", name: "pack_description" },
                                        { type: "byte", name: "block_frames" },
                                        { type: "onlyIf", name: "block_ani", key: "type", equals: (32*16), iterate: [
                                            { type: "loop", name: "block", options: { type: "const", num: (32*16) }, iterate: [
                                                { type: "byte", name: "block_ani" },
                                                ]},
                                            ]},
                                ]},
                                
                                { type: "loop", name: "background", options: { type: "const", num: 1 }, iterate: [
                                    { type: "byte", name: "image_show" },
                                    { type: "iid", name: "image" },
                                    { type: "byte", name: "image_type" },
                                    { type: "byte", name: "image_stretch" },
                                    { type: "byte", name: "image_box_mapped" },
                                    { type: "double", name: "sky_time" },
                                    { type: "byte", name: "sky_clouds" },
                                    { type: "byte", name: "sky_clouds_flat" },
                                    { type: "double", name: "sky_clouds_speed" },
                                    { type: "byte", name: "ground_show" },
                                    { type: "int", name: "ground_n" },
                                    { type: "iid", name: "ground" },
                                    { type: "byte", name: "biome" },
                                    { type: "int", name: "sky_color" },
                                    { type: "int", name: "sky_clouds_color" },
                                    { type: "int", name: "sunlight_color" },
                                    { type: "int", name: "ambient_color" },
                                    { type: "int", name: "night_color" },
                                    { type: "byte", name: "fog_show" },
                                    { type: "byte", name: "fog_sky" },
                                    { type: "byte", name: "fog_color_custom" },
                                    { type: "int", name: "fog_color" },
                                    { type: "int", name: "fog_distance" },
                                    { type: "int", name: "fog_size" },
                                    { type: "int", name: "fog_height" },
                                    { type: "byte", name: "wind" },
                                    { type: "double", name: "wind_speed" },
                                    { type: "double", name: "wind_strength" },
                                    { type: "byte", name: "opaque_leaves" },
                                    { type: "double", name: "texture_animation_speed" },
                                    { type: "int", name: "sunlight_range" },
                                    { type: "byte", name: "sunlight_follow", version: (load_format >= format_105)},
                                    { type: "iid", name: "sky_sun_tex" },
                                    { type: "iid", name: "sky_moon_tex" },
                                    { type: "int", name: "sky_moon_phase" },
                                    { type: "double", name: "sky_rotation" },
                                    { type: "iid", name: "sky_clouds_tex" },
                                    { type: "double", name: "sky_clouds_z" },
                                    { type: "double", name: "sky_clouds_size" },
                                    { type: "double", name: "sky_clouds_height" },
                                    
                                    
                                    
                                    
                                ]},
                                
                                { type: "loop", name: "camera", options: { type: "const", num: 1 }, iterate: [
                                        { type: "double", name: "work_focus_x" },
                                        { type: "double", name: "work_focus_y" },
                                        { type: "double", name: "work_focus_z" },
                                        { type: "double", name: "work_angle_xy" },
                                        { type: "double", name: "work_angle_z" },
                                        { type: "double", name: "work_roll" },
                                        { type: "double", name: "work_zoom" },
                                        
                                    ]}))
            
        }
    })
}

module.exports = {
    readMineimator: readMineimator
}