
        function readFile(data, cb) {
            
            if (!Buffer.isBuffer(data)) {
                cb(null, new Error("Invalid data type. The input must be a Buffer object."))
                return 0;
            }
                        var data = data;
                        var current = 0;
                        var loop = 0;
                        var obj = {};
                        var that = this;
                        
                        var safe = true;
                        
                        
                        this.save = function() {
                            var scope = this;
                            this.initSave = function() {
                                scope.save = {};
                            }
                            
                            this.setSave = function(objekt, value) {
                                scope.save[objekt.name] = value;
                            }
                        }
                        
                        var saveFunc = new this.save();
                        saveFunc.initSave();
                        
                        
                        
                        this.readBuffer = function(object) {
                            var value;
                            
                            this.preventRangeError = function(num) {
                                if ((data.length - (current + num)) < 0) {
                                    cb(null, new Error(`A buffer was read past its range. The current value is "${object.name}".`))
                                    safe = false;
                                }
                            }
                            
                            
                            
                            this.outputIfTrue = function(num) {
                                if (object.output == true) {
                                    console.log( { type: object.type, name: object.name, buffer: data.slice(current, (current + num)), data: value } );
                                }
                            }
                            
                            
                            
                            this.saveValue = function() {
                                if (object.save == true) {
                                    saveFunc.setSave(object, value);
                                }
                                
                                
                                
                            }
                            
                            
                                
                            
                            
                            
                            
                            if (object != undefined) {
                                switch (object.type) {
                                    
                                case "byte":
                                    
                               if ((typeof object.version != "undefined" && object.version) || object.version == undefined) {
                                    this.preventRangeError(1);
                                    value = data[current];
                                    this.outputIfTrue(1);
                                    current++;
                                    this.saveValue();
                                } else {
                                    value = undefined
                                }
                                    return value;
                                    
                                    
                                case "string":
                                    if ((typeof object.version != "undefined" && object.version) || object.version == undefined) {
                                        this.preventRangeError(4);
                                        var length = data.readInt32LE(current);
                                        current += 4;
                                        var string = "";
                                        this.preventRangeError(length);
                                        
                                        this.outputIfTrue(length);
                                        
                                        
                                        for (var s = current; s < (current + length); s++) {
                                            string += String.fromCharCode(data[s]);
                                            
                                        }
                                        
                                        current += length
                                        value = string;
                                        this.saveValue();
                                    } else {
                                        value = undefined
                                    }
                                    
                                    
                                    return value;
                                    
                                    
                                case "int":
                                    
                                    if ((typeof object.version != "undefined" && object.version) || object.version == undefined) {
                                        this.preventRangeError(4);
                                        value = data.readInt32LE(current);
                                        this.outputIfTrue(4);
                                        current += 4;
                                        this.saveValue();
                                    } else {
                                        value = undefined
                                    }
                                    
                                    return value;
                                    
                                case "short":
                                    
                                    if ((typeof object.version != "undefined" && object.version) || object.version == undefined) {
                                        this.preventRangeError(2);
                                        value = data.readInt16LE(current);
                                        this.outputIfTrue(2);
                                        current += 2;
                                        this.saveValue();
                                    } else {
                                        value = undefined
                                    }
                                    
                                    return value;
                                    
                                case "double":
                                    if ((typeof object.version != "undefined" && object.version) || object.version == undefined) {
                                        this.preventRangeError(8);
                                        value = data.readDoubleLE(current);
                                        this.outputIfTrue(8);
                                        current += 8;
                                        this.saveValue();
                                    } else {
                                        value = undefined
                                    }
                                    
                                   
                                    return value;
                                    
                                case "iid":
                                    
                                    if ((typeof object.version != "undefined" && object.version) || object.version == undefined) {
                                        this.preventRangeError(4);
                                        value = data.readInt32LE(current);
                                        var val = Math.max(val, value);
                                        this.outputIfTrue(4);
                                        current += 4;
                                        this.saveValue();
                                        return value; 
                                    } else {
                                        value = undefined
                                    }
                                    
                                    
                                    
                                case "const":
                                    return object.num;
                                    
                                
                                    
                                    
                                    
                                case "loop":
                                    
                                        
                                        
                                        loopArrIndex++;
                                        loopArr[loopArrIndex] = { amount: this.readBuffer(object.options), content: [], placeholder: {} };
                                        
                                        
                                        for (var l = 0; l < loopArr[loopArrIndex].amount; l++) {
                                            
                                            for (var i = 0; i < object.iterate.length; i++) {
                                                loopArr[loopArrIndex].placeholder[object.iterate[i].name] = this.readBuffer(object.iterate[i]);
                                            }
                                            
                                            loopArr[loopArrIndex].content.push(loopArr[loopArrIndex].placeholder);
                                            loopArr[loopArrIndex].placeholder = [];
                                            
                                        }
                                        
                                        loopArrIndex--;
                                        return loopArr[(loopArrIndex + 1)].content;
                                    
                                
                                    
                                case "onlyIf":
                                    var ifObj = {};
                                    
                                    if (saveFunc.save[object.key] == object.equals && object.key != undefined) {
                                        for (var onlyIf = 0; onlyIf < object.iterate.length; onlyIf++) {
                                            ifObj[object.iterate[onlyIf].name] = this.readBuffer(object.iterate[onlyIf]);
                                        }
                                    } else {
                                        
                                    }
                                    
                                    return ifObj;
                                    
                                
                                    
                                case "output":
                                    return data.slice(current, (current + object.amount));
                                    
                                case "char":
                                    var evaluate = this.readBuffer(object.options);
                                    if (evaluate <= 19) {
                                        switch(evaluate) {
                                            case 0: return "characterhuman";
                                            case 1: return "characterzombie";
                                            case 2: return "characterskeleton";
                                            case 3: return "charactercreeper";
                                            case 4: return "characterspider";
                                            case 5: return "characterenderman";
                                            case 6: return "characterslime";
                                            case 7: return "characterghast";
                                            case 8: return "characterzombiepigman";
                                            case 9: return "characterchicken";
                                            case 10: return "charactercow";
                                            case 11: return "charactermooshroom";
                                            case 12: return "characterpig";
                                            case 13: return "charactersheep";
                                            case 14: return "charactersquid";
                                            case 15: return "charactervillager";
                                            case 16: return "characterocelot";
                                            case 17: return "characterwolf";
                                            case 18: return "characterirongolem";
                                            case 19: return "charactersnowman";
                                        }
                                    } else if (load_format == format_05) {
                                        switch(evaluate) {
                                            case 20: return "characterhuman";
                                            case 21: return "characterpig";
                                        }
                                    } else if (load_format <= format_07demo) {
                                        switch(evaluate) {
                                            case 20: return "charactersilverfish"
                                            case 21: return "characterbat"
                                            case 22: return "characterzombievillager"
                                            case 23: return "characterwitch"
                                            case 24: return "charactercavespider"
                                            case 25: return "characterwitherskeleton"
                                            case 26: return "characterwither"
                                            case 27: return "characterhuman" 
                                            case 28: return "characterpig" 
                                            case 29: return "specialblockchest"
                                            case 30: return "specialblocklargechest"
                                            case 31: return "specialblocklever"
                                            case 32: return "specialblockpiston"
                                            case 33: return "specialblockstickypiston"
                                            case 34: return "specialblockarrow"
                                            case 35: return "specialblockboat"
                                            case 36: return "specialblockminecart"
                                        }
                                    } else {
                                        switch(evaluate) {
                                            case 20: return "charactersilverfish"
                                            case 21: return "characterbat"
                                            case 22: return "characterzombievillager"
                                            case 23: return "characterwitch"
                                            case 24: return "charactercavespider"
                                            case 25: return "characterwitherskeleton"
                                            case 26: return "characterwither"
                                            case 27: return "characterblaze"
                                            case 28: return "charactermagmacube"
                                            case 29: return "characterhorse"
                                            case 30: return "characterdonkey"
                                            case 31: return "characterenderdragon"
                                            case 32: return "specialblockchest"
                                            case 33: return "specialblocklargechest"
                                            case 34: return "specialblocklever"
                                            case 35: return "specialblockpiston"
                                            case 36: return "specialblockstickypiston"
                                            case 37: return "specialblockarrow"
                                            case 38: return "specialblockboat"
                                            case 39: return "specialblockminecart"
                                            case 40: return "specialblockenchantmenttable"
                                            case 41: return "specialblocksignpost"
                                            case 42: return "specialblockwallsign"
                                            case 43: return "specialblockboat" 
                                            case 44: return "specialblockboat" 
                                            case 45: return "specialblockboat" 
                                            case 46: return "specialblockendercrystal"
                                            case 47: return "specialblockcamera"
                                        }
                                    }
                                    
                                    
                                    break;
                                    
                                    
                                    
                                
                            
                                }
                            }
                            
                            
                                    
                                    
                        };
                        
                        var loopArr = [];
                        var loopArrIndex = -1;
                        
                       
                        this.bufferOrder = function() {
                            
                            
                            
                            var obj = {};
                            
                            
                            for (var a = 0; a < arguments.length; a++) {
                                if (safe) {
                                    obj[arguments[a].name] = this.readBuffer(arguments[a]);
                                } else {
                                    return 0;
                                }
                                        
                            }
                            return obj;
                        };
                        
                            var format_01 = 1;
                            var format_02 = 2;
                            var format_05 = 3;
                            var format_06 = 4;
                            var format_07demo = 5;
                            var format_100demo2 = 6;
                            var format_100demo3 = 7;
                            var format_100demo4 = 8;
                            var format_100debug = 9;
                            var format_100 = 10;
                            var format_105 = 11;
                            var format_105_2 = 12;
                            var format_106 = 13;
                            
                            
                            
                            
                            
                            
                        
                        
                            var load_format = this.readBuffer({ type: "byte" })
                            
                            if (load_format < format_100demo3) {
                                cb(null,  new Error("Anything below Mineimator 1.0.0 Demo 3 is currently not supported. Please update the file or wait for a future release"))
                            }
                            
                        
                                var output = this.bufferOrder(
                                { type: "string", name: "project_name" },
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
                                    { type: "loop", name: "part_amount", options: {type: "short"}, iterate: [
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
                                        
                                    ]});
                                    
                            if (safe) {
                                cb(output, null);
                            }    
    }

module.exports = {
    readFile: readFile
}