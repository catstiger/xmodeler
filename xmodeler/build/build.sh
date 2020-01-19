#!/bin/sh

#打包核心类库
java -jar compiler.jar --js_output_file ../xmodeler.engine.min.js \
                       --js ../Utils.js \
                       --js ../src/base/GraphicsEx.js \
                       --js ../src/base/Element.js \
                       --js ../src/base/BoxObject.js \
                       --js ../src/base/FixSizeObject.js \
                       --js ../src/base/AbstractActivity.js \
                       --js ../src/base/AbstractTask.js \
                       --js ../src/base/AbstractEvent.js \
                       --js ../src/base/AbstractGateway.js \
                       --js ../src/base/AbstractConnection.js \
                       --js ../src/base/AbstractContainer.js \
                       --js ../src/base/ShadowFlow.js \
                       --js ../src/base/ShadowBox.js \
                       --js ../src/base/DockableObject.js \
                       --js ../src/base/ContextMenu.js \
                       --js ../src/base/Engine.js 
#打包Activiti扩展
java -jar compiler.jar --js_output_file ../xmodeler.activity.min.js \
                       --js ../src/impl/activity/ActivityEngine.js \
                       --js ../src/impl/activity/SequenceFlow.js \
                       --js ../src/impl/activity/UserTask.js \
                       --js ../src/impl/activity/ServiceTask.js \
                       --js ../src/impl/activity/StartEvent.js \
                       --js ../src/impl/activity/EndEvent.js \
                       --js ../src/impl/activity/ParallelGateway.js \
                       --js ../src/impl/activity/ScriptTask.js \
                       --js ../src/impl/activity/ErrorEndEvent.js \
                       --js ../src/impl/activity/ExclusiveGateway.js \
                       --js ../src/impl/activity/SubProcess.js \
                       --js ../src/impl/activity/TimerEvent.js \
                       --js ../src/impl/activity/ActivityAdapter.js
#all together
java -jar compiler.jar --js_output_file ../xmodeler.activiti.all.js \
                       --js ../Utils.js \
                       --js ../src/base/GraphicsEx.js \
                       --js ../src/base/Element.js \
                       --js ../src/base/BoxObject.js \
                       --js ../src/base/FixSizeObject.js \
                       --js ../src/base/AbstractActivity.js \
                       --js ../src/base/AbstractTask.js \
                       --js ../src/base/AbstractEvent.js \
                       --js ../src/base/AbstractGateway.js \
                       --js ../src/base/AbstractConnection.js \
                       --js ../src/base/AbstractContainer.js \
                       --js ../src/base/ShadowFlow.js \
                       --js ../src/base/ShadowBox.js \
                       --js ../src/base/DockableObject.js \
                       --js ../src/base/ContextMenu.js \
                       --js ../src/base/Engine.js \
                       --js ../src/impl/activity/ActivityEngine.js \
                       --js ../src/impl/activity/SequenceFlow.js \
                       --js ../src/impl/activity/UserTask.js \
                       --js ../src/impl/activity/ServiceTask.js \
                       --js ../src/impl/activity/StartEvent.js \
                       --js ../src/impl/activity/EndEvent.js \
                       --js ../src/impl/activity/ParallelGateway.js \
                       --js ../src/impl/activity/ScriptTask.js \
                       --js ../src/impl/activity/ErrorEndEvent.js \
                       --js ../src/impl/activity/ExclusiveGateway.js \
                       --js ../src/impl/activity/SubProcess.js \
                       --js ../src/impl/activity/TimerEvent.js \
                       --js ../src/impl/activity/ActivityAdapter.js